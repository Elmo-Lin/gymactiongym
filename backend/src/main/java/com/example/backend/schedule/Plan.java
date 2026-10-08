package com.example.backend.schedule;

import java.util.List;
import java.util.Optional;

// 課程方案，需與前端 frontend/src/data/classes.js 保持一致。price 為每人每堂的價格
public record Plan(String id, int capacity, int price, boolean singleOnly) {

	public static final List<Plan> ALL = List.of(
			new Plan("trial", 1, 800, true),
			new Plan("one-on-one", 1, 1600, false),
			new Plan("one-on-two", 2, 1000, false));

	public static Optional<Plan> find(String id) {
		return ALL.stream().filter((plan) -> plan.id().equals(id)).findFirst();
	}

}
