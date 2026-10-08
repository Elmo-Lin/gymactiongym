package com.example.backend.order;

import static com.example.backend.support.FirestoreSupport.await;
import static com.example.backend.support.FirestoreSupport.toInstant;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class OrderRepository {

	private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

	private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyMMdd");

	private static final ZoneId TAIPEI = ZoneId.of("Asia/Taipei");

	private final SecureRandom random = new SecureRandom();

	private final CollectionReference orders;

	public OrderRepository(Firestore firestore) {
		this.orders = firestore.collection("orders");
	}

	public Order create(OrderRequest request) {
		String reference = generateReference();
		int total = request.items().stream().mapToInt((item) -> item.price() * item.qty()).sum();
		Timestamp now = Timestamp.now();

		Map<String, Object> data = new HashMap<>();
		data.put("contact", toMap(request.contact()));
		data.put("items", request.items().stream().map(OrderRepository::toMap).toList());
		data.put("total", total);
		data.put("createdAt", now);

		// 訂單編號直接當文件 ID；用 create 而不是 set，編號重複時會失敗而不會蓋掉舊訂單
		await(orders.document(reference).create(data));
		return new Order(reference, request.contact(), request.items(), total, toInstant(now));
	}

	public Optional<Order> findByReference(String reference) {
		DocumentSnapshot snapshot = await(orders.document(reference).get());
		if (!snapshot.exists()) {
			return Optional.empty();
		}
		@SuppressWarnings("unchecked")
		Map<String, Object> contact = (Map<String, Object>) snapshot.get("contact");
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> items = (List<Map<String, Object>>) snapshot.get("items");
		return Optional.of(new Order(
				snapshot.getId(),
				toContact(contact),
				items.stream().map(OrderRepository::toItem).toList(),
				snapshot.getLong("total").intValue(),
				toInstant(snapshot.getTimestamp("createdAt"))));
	}

	// OD + 日期 + 兩組 4 碼亂數，例如 OD261008-X7K2-9QPM。
	// 查詢訂單只需要編號，亂數要夠長才不會被逐一猜中（32^8 ≈ 1 兆種組合）
	private String generateReference() {
		StringBuilder code = new StringBuilder("OD").append(LocalDate.now(TAIPEI).format(CODE_DATE));
		for (int group = 0; group < 2; group++) {
			code.append('-');
			for (int i = 0; i < 4; i++) {
				code.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
			}
		}
		return code.toString();
	}

	private static Map<String, Object> toMap(OrderRequest.Contact contact) {
		Map<String, Object> map = new HashMap<>();
		map.put("name", contact.name());
		map.put("phone", contact.phone());
		map.put("note", contact.note());
		return map;
	}

	private static Map<String, Object> toMap(OrderRequest.Item item) {
		Map<String, Object> map = new HashMap<>();
		map.put("productId", item.productId());
		map.put("name", item.name());
		map.put("seriesName", item.seriesName());
		map.put("option", item.option());
		map.put("price", item.price());
		map.put("qty", item.qty());
		return map;
	}

	private static OrderRequest.Contact toContact(Map<String, Object> map) {
		return new OrderRequest.Contact((String) map.get("name"), (String) map.get("phone"), (String) map.get("note"));
	}

	// Firestore 讀回來的整數是 Long，要轉回 int
	private static OrderRequest.Item toItem(Map<String, Object> map) {
		return new OrderRequest.Item(
				(String) map.get("productId"),
				(String) map.get("name"),
				(String) map.get("seriesName"),
				(String) map.get("option"),
				((Number) map.get("price")).intValue(),
				((Number) map.get("qty")).intValue());
	}

}
