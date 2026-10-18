package com.example.backend.schedule;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// 教練在後台排的課（lessons 集合）也會佔用網站上的時段：
// 同一天、開始時間相差不到一堂課的長度（例如 19:30 的課會擋住 19:00 和 20:00）就算重疊，不能再被預約。
// 已刪除學生的課不算（刪除學生只是標記，排課還留著，復原時才不會不見）
public final class CoachLessons {

	// 查詢方式：一般查詢直接等結果；在 transaction 裡要改用 transaction 讀取，才會一起被鎖定
	public interface Reader {
		List<? extends DocumentSnapshot> query(Query query);

		List<DocumentSnapshot> getAll(List<DocumentReference> refs);
	}

	public record Busy(String date, String time) {

		public boolean blocks(String slotDate, String slotTime) {
			long minutes = Math.abs(Duration.between(LocalTime.parse(time), LocalTime.parse(slotTime)).toMinutes());
			return date.equals(slotDate) && minutes < WeeklySchedule.SESSION_MINUTES;
		}
	}

	private CoachLessons() {
	}

	public static List<Busy> between(Firestore firestore, Reader reader, LocalDate from, LocalDate to) {
		List<? extends DocumentSnapshot> lessons = reader.query(firestore.collection("lessons")
				.whereGreaterThanOrEqualTo("date", from.toString())
				.whereLessThanOrEqualTo("date", to.toString()));
		if (lessons.isEmpty()) {
			return List.of();
		}

		List<DocumentReference> studentRefs = lessons.stream()
				.map((lesson) -> lesson.getString("studentId"))
				.distinct()
				.map((id) -> firestore.collection("students").document(id))
				.toList();
		Set<String> active = reader.getAll(studentRefs).stream()
				.filter((student) -> student.exists() && student.getString("deletedAt") == null)
				.map(DocumentSnapshot::getId)
				.collect(Collectors.toSet());

		return lessons.stream()
				.filter((lesson) -> active.contains(lesson.getString("studentId")))
				.map((lesson) -> new Busy(lesson.getString("date"), lesson.getString("time")))
				.toList();
	}

	public static boolean blocks(List<Busy> busy, String date, String time) {
		return busy.stream().anyMatch((b) -> b.blocks(date, time));
	}

}
