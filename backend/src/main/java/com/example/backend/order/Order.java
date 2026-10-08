package com.example.backend.order;

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
		String phone = contact.phone();
		String masked = (phone == null || phone.length() < 8)
				? "***"
				: phone.substring(0, 4) + "***" + phone.substring(phone.length() - 3);
		return new Order(reference, new OrderRequest.Contact(contact.name(), masked, contact.note()), items, total,
				createdAt);
	}

}
