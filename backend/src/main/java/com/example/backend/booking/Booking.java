package com.example.backend.booking;

import com.example.backend.support.Masking;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

// 欄位與前端 Booking.jsx 送出的預約資料相同，方便預約完成頁直接使用
public record Booking(
		String reference,
		String planId,
		String mode,
		// 單次才有 date；每週固定才有 startDate、weeks
		LocalDate date,
		LocalDate startDate,
		Integer weeks,
		// 0 = 週日 … 6 = 週六，與前端相同
		int weekday,
		String time,
		String endTime,
		int sessions,
		double discount,
		int people,
		Price price,
		BookingRequest.Contact contact,
		List<String> partners,
		String goal,
		String experience,
		String note,
		Instant createdAt) {

	public record Price(int perSession, int subtotal, int total, int saved) {
	}

	// 查詢預約時使用：遮住電話與 Email，並拿掉備註（可能有舊傷等健康資訊）
	public Booking withMaskedContact() {
		BookingRequest.Contact masked = new BookingRequest.Contact(contact.name(), Masking.phone(contact.phone()),
				Masking.email(contact.email()));
		return new Booking(reference, planId, mode, date, startDate, weeks, weekday, time, endTime, sessions, discount,
				people, price, masked, partners, goal, experience, null, createdAt);
	}

}
