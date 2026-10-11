package com.example.backend.admin;

import static com.example.backend.support.FirestoreSupport.await;

import com.example.backend.admin.CoachModels.AdminData;
import com.example.backend.admin.CoachModels.Exercise;
import com.example.backend.admin.CoachModels.ExerciseSet;
import com.example.backend.admin.CoachModels.ImportRequest;
import com.example.backend.admin.CoachModels.Lesson;
import com.example.backend.admin.CoachModels.LessonRequest;
import com.example.backend.admin.CoachModels.PackageResult;
import com.example.backend.admin.CoachModels.SessionRequest;
import com.example.backend.admin.CoachModels.SessionResult;
import com.example.backend.admin.CoachModels.Student;
import com.example.backend.admin.CoachModels.StudentRequest;
import com.example.backend.admin.CoachModels.TrainingSession;
import com.example.backend.schedule.SlotService;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.WriteBatch;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

// 教練後台的資料，存在三個集合：
//   students          學生基本資料與堂數
//   trainingSessions  訓練紀錄（studentId 指向學生）
//   lessons           教練排的課（和客人在網站上的預約 bookings 分開）
@Repository
public class CoachRepository {

	// 排課只載入最近 8 週以後的課，太舊的不需要顯示
	private static final int LESSON_HISTORY_WEEKS = 8;

	// Firestore 一次批次寫入最多 500 筆
	private static final int MAX_BATCH_WRITES = 500;

	// 匯入時沿用前端給的 ID（例如 s1、b3），只允許安全的字元，避免被當成子路徑
	private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9_-]{1,64}");

	private final Firestore firestore;

	private final CollectionReference students;

	private final CollectionReference sessions;

	private final CollectionReference lessons;

	public CoachRepository(Firestore firestore) {
		this.firestore = firestore;
		this.students = firestore.collection("students");
		this.sessions = firestore.collection("trainingSessions");
		this.lessons = firestore.collection("lessons");
	}

	public AdminData load() {
		Map<String, List<TrainingSession>> history = new HashMap<>();
		await(sessions.get()).getDocuments().stream()
				.sorted(Comparator.comparing((QueryDocumentSnapshot doc) -> doc.getString("date"))
						.thenComparing((doc) -> doc.getTimestamp("createdAt"), Comparator.nullsFirst(Comparator.naturalOrder())))
				.forEach((doc) -> history.computeIfAbsent(doc.getString("studentId"), (k) -> new ArrayList<>()).add(toSession(doc)));

		List<Student> studentList = await(students.orderBy("createdAt").get()).getDocuments().stream()
				.map((doc) -> toStudent(doc, history.getOrDefault(doc.getId(), List.of())))
				.toList();

		String since = LocalDate.now(SlotService.TAIPEI).minusWeeks(LESSON_HISTORY_WEEKS).toString();
		List<Lesson> lessonList = await(lessons.whereGreaterThanOrEqualTo("date", since).get()).getDocuments().stream()
				.map(CoachRepository::toLesson)
				.sorted(Comparator.comparing((Lesson l) -> l.date() + l.time()))
				.toList();

		return new AdminData(studentList, lessonList);
	}

	public Student createStudent(StudentRequest request) {
		DocumentReference ref = students.document();
		Map<String, Object> data = profileMap(request);
		data.put("total", 0);
		data.put("remaining", 0);
		data.put("createdAt", Timestamp.now());
		await(ref.create(data));
		return toStudent(ref.getId(), request, 0, 0);
	}

	public Student updateStudent(String id, StudentRequest request) {
		DocumentReference ref = students.document(id);
		return await(firestore.runTransaction((tx) -> {
			DocumentSnapshot snapshot = tx.get(ref).get();
			if (!snapshot.exists()) {
				throw notFound("找不到這位學生");
			}
			tx.update(ref, profileMap(request));
			return toStudent(id, request, intValue(snapshot.get("total")), intValue(snapshot.get("remaining")));
		}));
	}

	// 購買堂數：累計堂數與剩餘堂數同時增加
	public PackageResult addPackage(String id, int count) {
		DocumentReference ref = students.document(id);
		return await(firestore.runTransaction((tx) -> {
			DocumentSnapshot snapshot = tx.get(ref).get();
			if (!snapshot.exists()) {
				throw notFound("找不到這位學生");
			}
			int total = intValue(snapshot.get("total")) + count;
			int remaining = intValue(snapshot.get("remaining")) + count;
			tx.update(ref, "total", total, "remaining", remaining);
			return new PackageResult(total, remaining);
		}));
	}

	// 記錄訓練：在同一個 transaction 裡新增紀錄、扣 1 堂（最少到 0）、把對應的課標記為已記錄
	public SessionResult logSession(String studentId, SessionRequest request) {
		DocumentReference studentRef = students.document(studentId);
		DocumentReference lessonRef = request.bookingId() == null ? null : lessons.document(request.bookingId());
		DocumentReference sessionRef = sessions.document();
		TrainingSession session = new TrainingSession(sessionRef.getId(), request.date(), request.plan(),
				request.exercises(), request.note());

		return await(firestore.runTransaction((tx) -> {
			// transaction 規定：所有讀取都要在寫入之前
			DocumentSnapshot student = tx.get(studentRef).get();
			if (!student.exists()) {
				throw notFound("找不到這位學生");
			}
			DocumentSnapshot lesson = lessonRef == null ? null : tx.get(lessonRef).get();

			int remaining = Math.max(0, intValue(student.get("remaining")) - 1);
			tx.create(sessionRef, sessionMap(studentId, session));
			tx.update(studentRef, "remaining", remaining);
			if (lesson != null && lesson.exists() && studentId.equals(lesson.getString("studentId"))) {
				tx.update(lessonRef, "done", true);
			}
			return new SessionResult(session, remaining);
		}));
	}

	public Lesson addLesson(LessonRequest request) {
		if (!await(students.document(request.studentId()).get()).exists()) {
			throw notFound("找不到這位學生");
		}
		DocumentReference ref = lessons.document();
		Lesson lesson = new Lesson(ref.getId(), request.date(), request.time(), request.studentId(), request.plan(), false);
		await(ref.create(lessonMap(lesson)));
		return lesson;
	}

	// 改期：已經記錄過訓練的課不能改
	public Lesson moveLesson(String id, String date) {
		DocumentReference ref = lessons.document(id);
		return await(firestore.runTransaction((tx) -> {
			DocumentSnapshot snapshot = tx.get(ref).get();
			if (!snapshot.exists()) {
				throw notFound("找不到這堂課");
			}
			if (Boolean.TRUE.equals(snapshot.getBoolean("done"))) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "已記錄的課不能改期");
			}
			tx.update(ref, "date", date);
			Lesson lesson = toLesson(snapshot);
			return new Lesson(lesson.id(), date, lesson.time(), lesson.studentId(), lesson.plan(), false);
		}));
	}

	// 匯入示範資料：資料庫裡已經有學生就拒絕，避免和真實資料混在一起
	public AdminData importDemo(ImportRequest request) {
		if (!await(students.limit(1).get()).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "已經有學生資料，不能匯入示範資料");
		}

		WriteBatch batch = firestore.batch();
		int writes = 0;
		long now = System.currentTimeMillis();
		for (int i = 0; i < request.students().size(); i++) {
			Student student = request.students().get(i);
			Map<String, Object> data = profileMap(new StudentRequest(student.name(), student.gender(), student.age(),
					student.goal(), student.plans(), student.phone(), student.note()));
			data.put("total", student.total());
			data.put("remaining", student.remaining());
			// 依匯入的順序排列：每位學生的建立時間相差 1 毫秒
			data.put("createdAt", Timestamp.ofTimeMicroseconds((now + i) * 1000));
			batch.set(students.document(safeId(student.id())), data);
			writes++;
			for (TrainingSession session : student.history() == null ? List.<TrainingSession>of() : student.history()) {
				batch.set(sessions.document(safeId(session.id())), sessionMap(student.id(), session));
				writes++;
			}
		}
		for (Lesson lesson : request.lessons()) {
			batch.set(lessons.document(safeId(lesson.id())), lessonMap(lesson));
			writes++;
		}
		if (writes > MAX_BATCH_WRITES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "匯入的資料太多");
		}

		await(batch.commit());
		return load();
	}

	private static String safeId(String id) {
		if (id == null || !SAFE_ID.matcher(id).matches()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID 格式不正確：" + id);
		}
		return id;
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}

	// ---------- 與 Firestore 文件互相轉換 ----------

	private static Map<String, Object> profileMap(StudentRequest request) {
		Map<String, Object> data = new HashMap<>();
		data.put("name", request.name());
		data.put("gender", request.gender());
		data.put("age", request.age());
		data.put("goal", request.goal());
		data.put("plans", request.plans());
		data.put("phone", request.phone());
		data.put("note", request.note());
		return data;
	}

	private static Student toStudent(String id, StudentRequest request, int total, int remaining) {
		return new Student(id, request.name(), request.gender(), request.age(), request.goal(), request.plans(),
				request.phone(), request.note(), total, remaining, List.of());
	}

	@SuppressWarnings("unchecked")
	private static Student toStudent(DocumentSnapshot doc, List<TrainingSession> history) {
		Long age = doc.getLong("age");
		List<String> plans = (List<String>) doc.get("plans");
		return new Student(doc.getId(), doc.getString("name"), doc.getString("gender"), age == null ? null : age.intValue(),
				doc.getString("goal"), plans == null ? List.of() : plans, doc.getString("phone"), doc.getString("note"),
				intValue(doc.get("total")), intValue(doc.get("remaining")), history);
	}

	private static Map<String, Object> sessionMap(String studentId, TrainingSession session) {
		List<Map<String, Object>> exercises = session.exercises().stream().map((exercise) -> {
			List<Map<String, Object>> sets = exercise.sets().stream()
					.map((set) -> Map.<String, Object>of("weight", set.weight(), "reps", set.reps()))
					.toList();
			return Map.<String, Object>of("name", exercise.name(), "sets", sets);
		}).toList();

		Map<String, Object> data = new HashMap<>();
		data.put("studentId", studentId);
		data.put("date", session.date());
		data.put("plan", session.plan());
		data.put("exercises", exercises);
		data.put("note", session.note());
		data.put("createdAt", Timestamp.now());
		return data;
	}

	@SuppressWarnings("unchecked")
	private static TrainingSession toSession(DocumentSnapshot doc) {
		List<Map<String, Object>> exercises = (List<Map<String, Object>>) doc.get("exercises");
		return new TrainingSession(doc.getId(), doc.getString("date"), doc.getString("plan"),
				exercises == null ? List.of() : exercises.stream().map((exercise) -> {
					List<Map<String, Object>> sets = (List<Map<String, Object>>) exercise.get("sets");
					return new Exercise((String) exercise.get("name"), sets.stream()
							.map((set) -> new ExerciseSet(((Number) set.get("weight")).doubleValue(), intValue(set.get("reps"))))
							.toList());
				}).toList(),
				doc.getString("note"));
	}

	private static Map<String, Object> lessonMap(Lesson lesson) {
		Map<String, Object> data = new HashMap<>();
		data.put("date", lesson.date());
		data.put("time", lesson.time());
		data.put("studentId", lesson.studentId());
		data.put("plan", lesson.plan());
		data.put("done", lesson.done());
		return data;
	}

	private static Lesson toLesson(DocumentSnapshot doc) {
		return new Lesson(doc.getId(), doc.getString("date"), doc.getString("time"), doc.getString("studentId"),
				doc.getString("plan"), Boolean.TRUE.equals(doc.getBoolean("done")));
	}

	// Firestore 讀回來的整數是 Long
	private static int intValue(Object value) {
		return value == null ? 0 : ((Number) value).intValue();
	}

}
