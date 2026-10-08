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

	private final BookingService bookingService;

	private final BookingRepository bookingRepository;

	public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
		this.bookingService = bookingService;
		this.bookingRepository = bookingRepository;
	}

	@PostMapping
	public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request) {
		Booking booking = bookingService.create(request);
		return ResponseEntity.created(URI.create("/api/bookings/" + booking.reference())).body(booking);
	}

	@GetMapping("/{reference}")
	public ResponseEntity<Booking> get(@PathVariable String reference) {
		return ResponseEntity.of(bookingRepository.findByReference(reference).map(Booking::withMaskedContact));
	}

}
