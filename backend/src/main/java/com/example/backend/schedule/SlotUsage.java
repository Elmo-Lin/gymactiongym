package com.example.backend.schedule;

// Firestore 的 slots/{date}_{time} 文件：這個時段已被某筆預約佔用。文件存在就代表已被預約
public record SlotUsage(String date, String time, String bookingRef) {

	// 文件 ID，例如 2026-10-12_08:00
	public static String docId(String date, String time) {
		return date + "_" + time;
	}

}
