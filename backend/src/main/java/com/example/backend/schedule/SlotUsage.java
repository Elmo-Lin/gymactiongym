package com.example.backend.schedule;

// 已被網站預約佔用的時段（Firestore slots 集合的一份文件）。program 為空的舊資料都是健身的時段
public record SlotUsage(String program, String date, String time, String bookingRef) {

	// 文件 ID，例如健身 2026-10-12_08:00、皮拉提斯 pilates_2026-10-12_08:00。
	// 健身沿用原本的格式，已經存在的預約不用搬資料
	public static String docId(String program, String date, String time) {
		String id = date + "_" + time;
		return Plan.FITNESS.equals(program) ? id : program + "_" + id;
	}

}
