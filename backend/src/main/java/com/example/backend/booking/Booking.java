package com.example.backend.booking;

import java.time.Instant;

public record Booking(
		String id,
		String planId,
		String name,
		String phone,
		String email,
		String note,
		Instant createdAt) {
}
