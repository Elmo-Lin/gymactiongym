package com.example.backend.schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SlotService {

	public static final ZoneId TAIPEI = ZoneId.of("Asia/Taipei");

	private final SlotRepository slotRepository;

	public SlotService(SlotRepository slotRepository) {
		this.slotRepository = slotRepository;
	}

	// 固定課表 + 網站上的預約 + 教練在後台排的課 = 每個時段目前的狀態。
	// 兩間教室各自計算；後台排課是石頭教練的課，只會佔用健身的時段
	public List<Slot> getSlots(String program, LocalDate from, LocalDate to) {
		Map<String, SlotUsage> usages = slotRepository.findBetween(program, from, to);
		List<CoachLessons.Busy> lessons = Plan.FITNESS.equals(program) ? slotRepository.findCoachLessons(from, to) : List.of();
		LocalDateTime now = LocalDateTime.now(TAIPEI);

		List<Slot> slots = new ArrayList<>();
		for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
			for (WeeklySchedule.Entry entry : WeeklySchedule.entriesFor(date)) {
				SlotUsage usage = usages.get(SlotUsage.docId(program, date.toString(), entry.time()));
				boolean coachLesson = CoachLessons.blocks(lessons, date.toString(), entry.time());
				slots.add(toSlot(date, entry, usage, coachLesson, now));
			}
		}
		return slots;
	}

	// 已經開始的時段算結束；固定學員的時段、已有人透過網站預約、或和教練排的課重疊的時段算已被預約；其餘是空堂
	static Slot toSlot(LocalDate date, WeeklySchedule.Entry entry, SlotUsage usage, boolean coachLesson,
			LocalDateTime now) {
		LocalTime start = LocalTime.parse(entry.time());
		String status;
		if (!date.atTime(start).isAfter(now)) {
			status = "past";
		}
		else if (entry.fixed() || usage != null || coachLesson) {
			status = "taken";
		}
		else {
			status = "open";
		}
		return new Slot(date.toString(), entry.time(), start.plusMinutes(WeeklySchedule.SESSION_MINUTES).toString(),
				WeeklySchedule.SESSION_MINUTES, status);
	}

}
