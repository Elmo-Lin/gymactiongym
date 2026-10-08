package com.example.backend.booking;

import com.example.backend.schedule.Plan;
import com.example.backend.schedule.SlotService;
import com.example.backend.schedule.WeeklySchedule;
import com.example.backend.support.ReferenceGenerator;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {

	// 第一堂課最遠可以預約到幾天後
	private static final int BOOKING_WINDOW_DAYS = 28;

	// 每週固定的週數與折扣，需與前端 classes.js 的 weeklyPackages 一致
	private static final Map<Integer, Double> WEEKLY_DISCOUNTS = Map.of(4, 1.0, 8, 0.95, 12, 0.9);

	private final BookingRepository bookingRepository;

	public BookingService(BookingRepository bookingRepository) {
		this.bookingRepository = bookingRepository;
	}

	public Booking create(BookingRequest request) {
		// 1. 方案、週數、同行人數
		Plan plan = Plan.find(request.planId()).orElseThrow(() -> badRequest("找不到這個方案"));
		boolean weekly = "weekly".equals(request.mode());
		if (weekly && plan.singleOnly()) {
			throw badRequest("這個方案只能單次預約");
		}
		int weeks = weekly ? (request.weeks() == null ? 0 : request.weeks()) : 1;
		Double discount = weekly ? WEEKLY_DISCOUNTS.get(weeks) : Double.valueOf(1.0);
		if (discount == null) {
			throw badRequest("每週固定只能選 4、8 或 12 週");
		}
		if (request.partners().size() != plan.capacity() - 1) {
			throw badRequest("同行人數與方案不符");
		}

		// 2. 要上課的每一個日期：單次 1 天，每週固定為連續幾週的同一天
		List<LocalDate> dates = IntStream.range(0, weeks).mapToObj((i) -> request.date().plusWeeks(i)).toList();
		LocalDateTime now = LocalDateTime.now(SlotService.TAIPEI);
		if (request.date().isAfter(now.toLocalDate().plusDays(BOOKING_WINDOW_DAYS))) {
			throw badRequest("只能預約 " + BOOKING_WINDOW_DAYS + " 天內開始的課程");
		}

		// 3. 每個日期都要有這個時段、還沒開始、不是固定學員的時段。
		//    有沒有被別人透過網站預約，要到 transaction 裡才能確認
		LocalTime start = LocalTime.parse(request.time());
		for (LocalDate date : dates) {
			WeeklySchedule.Entry entry = WeeklySchedule.entriesFor(date).stream()
					.filter((e) -> e.time().equals(request.time()))
					.findFirst()
					.orElseThrow(() -> badRequest(date + " " + request.time() + " 沒有開放這個時段"));
			if (!date.atTime(start).isAfter(now)) {
				throw badRequest(date + " " + request.time() + " 已經開始或結束");
			}
			if (entry.fixed()) {
				throw new SlotTakenException(date.toString(), request.time());
			}
		}

		// 4. 價格由後端計算：方案單價 × 人數 × 堂數 × 折扣
		int people = plan.capacity();
		int perSession = plan.price() * people;
		int subtotal = perSession * weeks;
		int total = (int) Math.round(subtotal * discount);

		Booking booking = new Booking(
				ReferenceGenerator.generate("AG"),
				plan.id(),
				request.mode(),
				weekly ? null : request.date(),
				weekly ? request.date() : null,
				weekly ? weeks : null,
				request.date().getDayOfWeek().getValue() % 7,
				request.time(),
				start.plusMinutes(WeeklySchedule.SESSION_MINUTES).toString(),
				weeks,
				discount,
				people,
				new Booking.Price(perSession, subtotal, total, subtotal - total),
				request.contact(),
				request.partners(),
				request.goal(),
				request.experience(),
				request.note(),
				Instant.now());

		// 5. 在 transaction 裡確認時段都還空著，再一起寫入
		bookingRepository.create(booking, dates);
		return booking;
	}

	private static ResponseStatusException badRequest(String message) {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
	}

}
