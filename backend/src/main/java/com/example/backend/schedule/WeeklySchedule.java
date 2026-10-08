package com.example.backend.schedule;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// 每週課表。一個時段只屬於一位會員（由會員決定 1對1 或 1對2，同行的人是自己帶的朋友），
// 不會讓不認識的人一起上課。
//   open  → 空堂，可以在網站上預約
//   fixed → 固定學員每週都會來上課的時段，網站上顯示為已被預約
public final class WeeklySchedule {

	public static final int SESSION_MINUTES = 60;

	public record Entry(String time, boolean fixed) {
	}

	private static Entry open(String time) {
		return new Entry(time, false);
	}

	private static Entry fixed(String time) {
		return new Entry(time, true);
	}

	// 週日公休，沒有時段
	private static final Map<DayOfWeek, List<Entry>> WEEK = Map.of(
			DayOfWeek.MONDAY, List.of(
					fixed("07:00"), open("08:00"), fixed("10:00"), open("11:00"), open("14:00"),
					fixed("16:00"), fixed("18:00"), fixed("19:00"), fixed("20:00")),
			DayOfWeek.TUESDAY, List.of(
					open("07:00"), fixed("09:00"), open("10:00"), fixed("14:00"), open("15:00"),
					fixed("18:00"), fixed("19:00"), fixed("20:00")),
			DayOfWeek.WEDNESDAY, List.of(
					fixed("07:00"), open("08:00"), fixed("10:00"), open("11:00"), open("15:00"),
					open("16:00"), fixed("18:00"), fixed("19:00"), open("20:00")),
			DayOfWeek.THURSDAY, List.of(
					open("07:00"), fixed("09:00"), open("10:00"), open("14:00"), fixed("15:00"),
					fixed("18:00"), fixed("19:00"), fixed("20:00")),
			DayOfWeek.FRIDAY, List.of(
					fixed("07:00"), open("08:00"), open("10:00"), fixed("11:00"), open("14:00"),
					fixed("18:00"), open("19:00"), open("20:00")),
			DayOfWeek.SATURDAY, List.of(
					fixed("09:00"), fixed("10:00"), open("11:00"), open("13:00"), fixed("14:00"),
					open("15:00"), fixed("16:00")));

	private WeeklySchedule() {
	}

	public static List<Entry> entriesFor(LocalDate date) {
		return WEEK.getOrDefault(date.getDayOfWeek(), List.of());
	}

}
