package com.example.backend.booking;

import static com.example.backend.support.FirestoreSupport.await;
import static com.example.backend.support.FirestoreSupport.toInstant;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class BookingRepository {

	private final CollectionReference bookings;

	public BookingRepository(Firestore firestore) {
		this.bookings = firestore.collection("bookings");
	}

	public Booking create(BookingRequest request) {
		DocumentReference doc = bookings.document();
		Timestamp now = Timestamp.now();

		Map<String, Object> data = new HashMap<>();
		data.put("planId", request.planId());
		data.put("name", request.name());
		data.put("phone", request.phone());
		data.put("email", request.email());
		data.put("note", request.note());
		data.put("createdAt", now);

		await(doc.set(data));
		return new Booking(doc.getId(), request.planId(), request.name(), request.phone(), request.email(),
				request.note(), toInstant(now));
	}

	public Optional<Booking> findById(String id) {
		DocumentSnapshot snapshot = await(bookings.document(id).get());
		if (!snapshot.exists()) {
			return Optional.empty();
		}
		return Optional.of(new Booking(
				snapshot.getId(),
				snapshot.getString("planId"),
				snapshot.getString("name"),
				snapshot.getString("phone"),
				snapshot.getString("email"),
				snapshot.getString("note"),
				toInstant(snapshot.getTimestamp("createdAt"))));
	}

}
