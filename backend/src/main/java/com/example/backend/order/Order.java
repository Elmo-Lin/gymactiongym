package com.example.backend.order;

import com.example.backend.support.Masking;
import java.time.Instant;
import java.util.List;

public record Order(
		String reference,
		OrderRequest.Contact contact,
		List<OrderRequest.Item> items,
		int total,
		Instant createdAt) {

	// 查詢訂單時使用：遮住電話中間，例如 0912***678，避免訂單編號外流時洩漏個資
	public Order withMaskedPhone() {
		return new Order(reference,
				new OrderRequest.Contact(contact.name(), Masking.phone(contact.phone()), contact.note()), items, total,
				createdAt);
	}

}
