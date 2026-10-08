package com.example.backend.schedule;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
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

	// 全部都是空堂的時段。要把某個時段保留給固定學員，改用 new Entry("07:00", true)，
	// 並同步修改前端 frontend/src/data/schedule.js
	private static List<Entry> open(String... times) {
		return Arrays.stream(times).map((time) -> new Entry(time, false)).toList();
	}

	// 週日公休，沒有時段
	private static final Map<DayOfWeek, List<Entry>> WEEK = Map.of(
			DayOfWeek.MONDAY, open("07:00", "08:00", "10:00", "11:00", "14:00", "16:00", "18:00", "19:00", "20:00"),
			DayOfWeek.TUESDAY, open("07:00", "09:00", "10:00", "14:00", "15:00", "18:00", "19:00", "20:00"),
			DayOfWeek.WEDNESDAY, open("07:00", "08:00", "10:00", "11:00", "15:00", "16:00", "18:00", "19:00", "20:00"),
			DayOfWeek.THURSDAY, open("07:00", "09:00", "10:00", "14:00", "15:00", "18:00", "19:00", "20:00"),
			DayOfWeek.FRIDAY, open("07:00", "08:00", "10:00", "11:00", "14:00", "18:00", "19:00", "20:00"),
			DayOfWeek.SATURDAY, open("09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"));

	private WeeklySchedule() {
	}

	public static List<Entry> entriesFor(LocalDate date) {
		return WEEK.getOrDefault(date.getDayOfWeek(), List.of());
	}

}
