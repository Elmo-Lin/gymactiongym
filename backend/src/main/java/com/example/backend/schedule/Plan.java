package com.example.backend.schedule;

import java.util.List;
import java.util.Optional;
import java.util.Set;

// 課程方案，需與前端 frontend/src/data/classes.js 保持一致。
// 線上預約只保留時段，價格與套票於現場購買，所以這裡不記錄價格。
//   program：fitness 健身（石頭教練的教室）、pilates 皮拉提斯（霏霏教練的教室），兩間教室的時段分開計算
//   minPeople、capacity：上課人數範圍（會員 + 自己帶的朋友），例如皮拉提斯團課 2–4 人
public record Plan(String id, String program, int minPeople, int capacity, boolean singleOnly) {

	public static final String FITNESS = "fitness";

	public static final String PILATES = "pilates";

	public static final Set<String> PROGRAMS = Set.of(FITNESS, PILATES);

	public static final List<Plan> ALL = List.of(
			new Plan("trial", FITNESS, 1, 1, true),
			new Plan("one-on-one", FITNESS, 1, 1, false),
			new Plan("one-on-two", FITNESS, 2, 2, false),
			new Plan("pilates-solo", PILATES, 1, 1, false),
			new Plan("pilates-duo", PILATES, 2, 2, false),
			new Plan("pilates-group", PILATES, 2, 4, false));

	public static Optional<Plan> find(String id) {
		return ALL.stream().filter((plan) -> plan.id().equals(id)).findFirst();
	}

}
