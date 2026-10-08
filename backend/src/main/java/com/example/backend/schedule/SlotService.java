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

	// 固定課表 + Firestore 裡已被佔用的人數 = 每個時段目前的狀態
	public List<Slot> getSlots(LocalDate from, LocalDate to) {
		Map<String, SlotUsage> usages = slotRepository.findBetween(from, to);
		LocalDateTime now = LocalDateTime.now(TAIPEI);

		List<Slot> slots = new ArrayList<>();
		for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
			for (WeeklySchedule.Entry entry : WeeklySchedule.entriesFor(date)) {
				SlotUsage usage = usages.get(SlotUsage.docId(date.toString(), entry.time()));
				slots.add(toSlot(date, entry, usage, now));
			}
		}
		return slots;
	}

	// 已經開始的時段算結束；固定學員的時段或已有人透過網站預約的時段算已被預約；其餘是空堂
	static Slot toSlot(LocalDate date, WeeklySchedule.Entry entry, SlotUsage usage, LocalDateTime now) {
		LocalTime start = LocalTime.parse(entry.time());
		String status;
		if (!date.atTime(start).isAfter(now)) {
			status = "past";
		}
		else if (entry.fixed() || usage != null) {
			status = "taken";
		}
		else {
			status = "open";
		}
		return new Slot(date.toString(), entry.time(), start.plusMinutes(WeeklySchedule.SESSION_MINUTES).toString(),
				WeeklySchedule.SESSION_MINUTES, status);
	}

}
