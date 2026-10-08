package com.example.backend.booking;

import static com.example.backend.support.FirestoreSupport.await;
import static com.example.backend.support.FirestoreSupport.toInstant;

import com.example.backend.schedule.SlotUsage;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Repository;

@Repository
public class BookingRepository {

	private final Firestore firestore;

	private final CollectionReference bookings;

	private final CollectionReference slots;

	public BookingRepository(Firestore firestore) {
		this.firestore = firestore;
		this.bookings = firestore.collection("bookings");
		this.slots = firestore.collection("slots");
	}

	// 在同一個 transaction 裡：讀取每個時段 → 確認都還沒被預約 → 寫入預約並佔用所有時段。
	// 任何一個時段已被預約，整筆預約都不會寫入。
	// 兩個人同時搶同一個時段時，Firestore 會讓其中一個等另一個完成後再讀，所以第二個人一定會看到已被預約
	public void create(Booking booking, List<LocalDate> dates) {
		List<DocumentReference> slotRefs = dates.stream()
				.map((date) -> slots.document(SlotUsage.docId(date.toString(), booking.time())))
				.toList();
		DocumentReference bookingRef = bookings.document(booking.reference());

		ApiFuture<Object> result = firestore.runTransaction((transaction) -> {
			// transaction 規定：所有讀取都要在寫入之前
			List<DocumentSnapshot> snapshots = transaction.getAll(slotRefs.toArray(new DocumentReference[0])).get();
			for (DocumentSnapshot snapshot : snapshots) {
				if (snapshot.exists()) {
					throw new SlotTakenException(snapshot.getString("date"), snapshot.getString("time"));
				}
			}

			transaction.create(bookingRef, toMap(booking, dates));
			for (int i = 0; i < dates.size(); i++) {
				Map<String, Object> usage = new HashMap<>();
				usage.put("date", dates.get(i).toString());
				usage.put("time", booking.time());
				usage.put("bookingRef", booking.reference());
				transaction.create(slotRefs.get(i), usage);
			}
			return null;
		});

		try {
			result.get();
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("Firestore 操作被中斷", ex);
		}
		catch (ExecutionException ex) {
			// 在 transaction 裡丟出的 SlotTakenException 會被包在其他例外裡，找出來原樣丟出，才會回應 409
			for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
				if (cause instanceof SlotTakenException taken) {
					throw taken;
				}
			}
			throw new IllegalStateException("Firestore 操作失敗", ex.getCause());
		}
	}

	public Optional<Booking> findByReference(String reference) {
		DocumentSnapshot doc = await(bookings.document(reference).get());
		if (!doc.exists()) {
			return Optional.empty();
		}
		@SuppressWarnings("unchecked")
		Map<String, Object> contact = (Map<String, Object>) doc.get("contact");
		@SuppressWarnings("unchecked")
		Map<String, Object> price = (Map<String, Object>) doc.get("price");
		@SuppressWarnings("unchecked")
		List<String> partners = (List<String>) doc.get("partners");

		return Optional.of(new Booking(
				doc.getId(),
				doc.getString("planId"),
				doc.getString("mode"),
				toDate(doc.getString("date")),
				toDate(doc.getString("startDate")),
				toInteger(doc.get("weeks")),
				toInteger(doc.get("weekday")),
				doc.getString("time"),
				doc.getString("endTime"),
				toInteger(doc.get("sessions")),
				doc.getDouble("discount"),
				toInteger(doc.get("people")),
				new Booking.Price(toInteger(price.get("perSession")), toInteger(price.get("subtotal")),
						toInteger(price.get("total")), toInteger(price.get("saved"))),
				new BookingRequest.Contact((String) contact.get("name"), (String) contact.get("phone"),
						(String) contact.get("email")),
				partners == null ? List.of() : partners,
				doc.getString("goal"),
				doc.getString("experience"),
				doc.getString("note"),
				toInstant(doc.getTimestamp("createdAt"))));
	}

	private static LocalDate toDate(String value) {
		return value == null ? null : LocalDate.parse(value);
	}

	// Firestore 讀回來的整數是 Long，要轉回 Integer
	private static Integer toInteger(Object value) {
		return value == null ? null : ((Number) value).intValue();
	}

	private static Map<String, Object> toMap(Booking booking, List<LocalDate> dates) {
		Map<String, Object> contact = new HashMap<>();
		contact.put("name", booking.contact().name());
		contact.put("phone", booking.contact().phone());
		contact.put("email", booking.contact().email());

		Map<String, Object> price = new HashMap<>();
		price.put("perSession", booking.price().perSession());
		price.put("subtotal", booking.price().subtotal());
		price.put("total", booking.price().total());
		price.put("saved", booking.price().saved());

		Map<String, Object> data = new HashMap<>();
		data.put("planId", booking.planId());
		data.put("mode", booking.mode());
		data.put("date", booking.date() == null ? null : booking.date().toString());
		data.put("startDate", booking.startDate() == null ? null : booking.startDate().toString());
		data.put("weeks", booking.weeks());
		data.put("weekday", booking.weekday());
		data.put("time", booking.time());
		data.put("endTime", booking.endTime());
		data.put("sessions", booking.sessions());
		// 方便教練在 Firebase Console 直接看到每一堂的日期
		data.put("sessionDates", dates.stream().map(LocalDate::toString).toList());
		data.put("discount", booking.discount());
		data.put("people", booking.people());
		data.put("price", price);
		data.put("contact", contact);
		data.put("partners", booking.partners());
		data.put("goal", booking.goal());
		data.put("experience", booking.experience());
		data.put("note", booking.note());
		data.put("createdAt",
				Timestamp.ofTimeSecondsAndNanos(booking.createdAt().getEpochSecond(), booking.createdAt().getNano()));
		return data;
	}

}
