package com.example.backend.schedule;

import java.util.List;
import java.util.Optional;

// 課程方案，需與前端 frontend/src/data/classes.js 保持一致。
// 線上預約只保留時段，價格與套票於現場購買，所以這裡不記錄價格
public record Plan(String id, int capacity, boolean singleOnly) {

	public static final List<Plan> ALL = List.of(
			new Plan("trial", 1, true),
			new Plan("one-on-one", 1, false),
			new Plan("one-on-two", 2, false));

	public static Optional<Plan> find(String id) {
		return ALL.stream().filter((plan) -> plan.id().equals(id)).findFirst();
	}

}
