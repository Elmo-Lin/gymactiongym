package com.example.backend.schedule;

import static com.example.backend.support.FirestoreSupport.await;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class SlotRepository {

	private final CollectionReference slots;

	public SlotRepository(Firestore firestore) {
		this.slots = firestore.collection("slots");
	}

	// 日期範圍內被佔用的時段，key 為文件 ID。date 存成 2026-10-12 這種字串，依文字排序剛好就是日期順序
	public Map<String, SlotUsage> findBetween(LocalDate from, LocalDate to) {
		QuerySnapshot snapshot = await(slots
				.whereGreaterThanOrEqualTo("date", from.toString())
				.whereLessThanOrEqualTo("date", to.toString())
				.get());

		Map<String, SlotUsage> usages = new HashMap<>();
		for (DocumentSnapshot doc : snapshot.getDocuments()) {
			usages.put(doc.getId(), toUsage(doc));
		}
		return usages;
	}

	static SlotUsage toUsage(DocumentSnapshot doc) {
		return new SlotUsage(doc.getString("date"), doc.getString("time"), doc.getString("bookingRef"));
	}

}
