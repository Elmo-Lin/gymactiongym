package com.example.backend.schedule;

import static com.example.backend.support.FirestoreSupport.await;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class SlotRepository {

	private final Firestore firestore;

	private final CollectionReference slots;

	public SlotRepository(Firestore firestore) {
		this.firestore = firestore;
		this.slots = firestore.collection("slots");
	}

	// 日期範圍內教練在後台排的課，和這些課重疊的時段也算已被預約
	public List<CoachLessons.Busy> findCoachLessons(LocalDate from, LocalDate to) {
		return CoachLessons.between(firestore, new CoachLessons.Reader() {
			@Override
			public List<? extends DocumentSnapshot> query(Query query) {
				return await(query.get()).getDocuments();
			}

			@Override
			public List<DocumentSnapshot> getAll(List<DocumentReference> refs) {
				return await(firestore.getAll(refs.toArray(new DocumentReference[0])));
			}
		}, from, to);
	}

	// 日期範圍內這個教室被佔用的時段，key 為文件 ID。date 存成 2026-10-12 這種字串，依文字排序剛好就是日期順序。
	// 兩間教室的時段放在同一個集合，查出來再依 program 篩選（只用 date 查詢，不需要建立複合索引）
	public Map<String, SlotUsage> findBetween(String program, LocalDate from, LocalDate to) {
		QuerySnapshot snapshot = await(slots
				.whereGreaterThanOrEqualTo("date", from.toString())
				.whereLessThanOrEqualTo("date", to.toString())
				.get());

		Map<String, SlotUsage> usages = new HashMap<>();
		for (DocumentSnapshot doc : snapshot.getDocuments()) {
			SlotUsage usage = toUsage(doc);
			if (usage.program().equals(program)) {
				usages.put(doc.getId(), usage);
			}
		}
		return usages;
	}

	static SlotUsage toUsage(DocumentSnapshot doc) {
		String program = doc.getString("program");
		return new SlotUsage(program == null ? Plan.FITNESS : program, doc.getString("date"), doc.getString("time"),
				doc.getString("bookingRef"));
	}

}
