package com.example.backend.booking;

import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	private final BookingRepository bookingRepository;

	public BookingController(BookingRepository bookingRepository) {
		this.bookingRepository = bookingRepository;
	}

	@PostMapping
	public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request) {
		Booking booking = bookingRepository.create(request);
		return ResponseEntity.created(URI.create("/api/bookings/" + booking.id())).body(booking);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Booking> get(@PathVariable String id) {
		return ResponseEntity.of(bookingRepository.findById(id));
	}

}
