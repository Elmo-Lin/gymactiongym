package com.example.backend.order;

import java.time.Instant;
import java.util.List;

public record Order(
		String reference,
		OrderRequest.Contact contact,
		List<OrderRequest.Item> items,
		int total,
		Instant createdAt) {
}
