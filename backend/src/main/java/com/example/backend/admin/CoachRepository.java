package com.example.backend.admin;

import static com.example.backend.support.FirestoreSupport.await;

import com.example.backend.admin.CoachModels.AdminData;
import com.example.backend.admin.CoachModels.Exercise;
import com.example.backend.admin.CoachModels.ExerciseSet;
import com.example.backend.admin.CoachModels.ImportRequest;
import com.example.backend.admin.CoachModels.Lesson;
import com.example.backend.admin.CoachModels.LessonRequest;
import com.example.backend.admin.CoachModels.PackageResult;
import com.example.backend.admin.CoachModels.PersonalRecord;
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
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.WriteBatch;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
//   students          學生基本資料、堂數與 PR
//   trainingSessions  訓練紀錄（studentId 指向學生）
//   lessons           教練排的課（和客人在網站上的預約 bookings 分開）
//   coachSettings     後台設定，例如 coachSettings/exercises 存教練的動作清單
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

	private final DocumentReference exercisesDoc;

	public CoachRepository(Firestore firestore) {
		this.firestore = firestore;
		this.students = firestore.collection("students");
		this.sessions = firestore.collection("trainingSessions");
		this.lessons = firestore.collection("lessons");
		this.exercisesDoc = firestore.collection("coachSettings").document("exercises");
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

		return new AdminData(studentList, lessonList, loadExercises());
	}

	// 教練的動作清單；還沒儲存過時回傳 null，前端會使用預設清單
	@SuppressWarnings("unchecked")
	private List<String> loadExercises() {
		DocumentSnapshot doc = await(exercisesDoc.get());
		return doc.exists() ? (List<String>) doc.get("names") : null;
	}

	// 儲存動作清單：去掉前後空白與重複的名稱，保留原本的順序
	public List<String> saveExercises(List<String> names) {
		List<String> cleaned = names.stream().map(String::trim).filter((name) -> !name.isEmpty()).distinct().toList();
		await(exercisesDoc.set(Map.of("names", cleaned, "updatedAt", Timestamp.now())));
		return cleaned;
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

	// 刪除學生：只標記刪除時間，訓練紀錄與排課都保留，之後可以復原
	public String deleteStudent(String id) {
		String deletedAt = LocalDateTime.now(SlotService.TAIPEI).truncatedTo(ChronoUnit.MINUTES).toString();
		updateExisting(id, "deletedAt", deletedAt);
		return deletedAt;
	}

	public void restoreStudent(String id) {
		updateExisting(id, "deletedAt", FieldValue.delete());
	}

	private void updateExisting(String id, String field, Object value) {
		DocumentReference ref = students.document(id);
		await(firestore.runTransaction((tx) -> {
			if (!tx.get(ref).get().exists()) {
				throw notFound("找不到這位學生");
			}
			tx.update(ref, field, value);
			return null;
		}));
	}

	// 永久刪除：只能刪已經刪除（在「已刪除」裡）的學生，連同訓練紀錄與排課一起刪除，無法復原
	public void purgeStudent(String id) {
		DocumentReference ref = students.document(id);
		DocumentSnapshot snapshot = await(ref.get());
		if (!snapshot.exists()) {
			throw notFound("找不到這位學生");
		}
		if (snapshot.getString("deletedAt") == null) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "請先刪除這位學生，才能永久刪除");
		}
		List<DocumentReference> refs = new ArrayList<>();
		await(sessions.whereEqualTo("studentId", id).get()).getDocuments().forEach((doc) -> refs.add(doc.getReference()));
		await(lessons.whereEqualTo("studentId", id).get()).getDocuments().forEach((doc) -> refs.add(doc.getReference()));
		// 學生本身最後刪：中途失敗時學生還在，可以再刪一次把剩下的清掉
		refs.add(ref);
		for (int i = 0; i < refs.size(); i += MAX_BATCH_WRITES) {
			WriteBatch batch = firestore.batch();
			refs.subList(i, Math.min(i + MAX_BATCH_WRITES, refs.size())).forEach(batch::delete);
			await(batch.commit());
		}
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

	// 新增或更新 PR：同一個動作同一天已經有紀錄就蓋過（輸入錯了再輸入一次即可），回傳這位學生全部的 PR
	public List<PersonalRecord> savePr(String studentId, PersonalRecord request) {
		if (LocalDate.parse(request.date()).isAfter(LocalDate.now(SlotService.TAIPEI))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PR 日期不能是未來");
		}
		PersonalRecord record = new PersonalRecord(request.exercise().trim(), request.weight(), request.date());
		DocumentReference ref = students.document(studentId);
		return await(firestore.runTransaction((tx) -> {
			DocumentSnapshot snapshot = tx.get(ref).get();
			if (!snapshot.exists()) {
				throw notFound("找不到這位學生");
			}
			List<PersonalRecord> prs = new ArrayList<>(toPrs(snapshot));
			prs.removeIf((pr) -> pr.exercise().equals(record.exercise()) && pr.date().equals(record.date()));
			prs.add(record);
			prs.sort(Comparator.comparing(PersonalRecord::date));
			tx.update(ref, "prs", prs.stream().map(CoachRepository::prMap).toList());
			return prs;
		}));
	}

	// 修改堂數：直接設定累計購買與剩餘堂數
	public PackageResult setPackage(String id, int total, int remaining) {
		if (remaining > total) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "剩餘堂數不能超過累計購買堂數");
		}
		DocumentReference ref = students.document(id);
		return await(firestore.runTransaction((tx) -> {
			if (!tx.get(ref).get().exists()) {
				throw notFound("找不到這位學生");
			}
			tx.update(ref, "total", total, "remaining", remaining);
			return new PackageResult(total, remaining);
		}));
	}

	// 記錄訓練：在同一個 transaction 裡新增紀錄、把對應的課標記為已記錄。
	// 堂數在排課時就扣了，這裡不扣；只有改成排課扣堂之前排的課（沒有 charged）還沒扣過，記錄時補扣
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

			int remaining = intValue(student.get("remaining"));
			tx.create(sessionRef, sessionMap(studentId, session));
			if (lesson != null && lesson.exists() && studentId.equals(lesson.getString("studentId"))) {
				if (!Boolean.TRUE.equals(lesson.getBoolean("done")) && lesson.getBoolean("charged") == null) {
					remaining = Math.max(0, remaining - 1);
					tx.update(studentRef, "remaining", remaining);
				}
				tx.update(lessonRef, "done", true);
			}
			return new SessionResult(session, remaining);
		}));
	}

	// 排課：在同一個 transaction 裡新增課程、扣 1 堂；沒有剩餘堂數就不能排
	public Lesson addLesson(LessonRequest request) {
		DocumentReference studentRef = students.document(request.studentId());
		DocumentReference ref = lessons.document();
		Lesson lesson = new Lesson(ref.getId(), request.date(), request.time(), request.studentId(), request.plan(), false);

		return await(firestore.runTransaction((tx) -> {
			DocumentSnapshot student = tx.get(studentRef).get();
			if (!student.exists()) {
				throw notFound("找不到這位學生");
			}
			int remaining = intValue(student.get("remaining"));
			if (remaining <= 0) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "沒有剩餘堂數，請先購買堂數");
			}
			tx.create(ref, lessonMap(lesson));
			tx.update(studentRef, "remaining", remaining - 1);
			return lesson;
		}));
	}

	// 改期：已經記錄過訓練的課不能改，也不能改到今天以前（以台灣時間為準，不依賴瀏覽器的日期）
	public Lesson moveLesson(String id, String date) {
		if (LocalDate.parse(date).isBefore(LocalDate.now(SlotService.TAIPEI))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "不能改到今天以前");
		}
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
			data.put("prs", student.prs() == null ? List.of() : student.prs().stream().map(CoachRepository::prMap).toList());
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
				request.phone(), request.note(), total, remaining, List.of(), List.of(), null);
	}

	@SuppressWarnings("unchecked")
	private static Student toStudent(DocumentSnapshot doc, List<TrainingSession> history) {
		Long age = doc.getLong("age");
		List<String> plans = (List<String>) doc.get("plans");
		return new Student(doc.getId(), doc.getString("name"), doc.getString("gender"), age == null ? null : age.intValue(),
				doc.getString("goal"), plans == null ? List.of() : plans, doc.getString("phone"), doc.getString("note"),
				intValue(doc.get("total")), intValue(doc.get("remaining")), history, toPrs(doc), doc.getString("deletedAt"));
	}

	private static Map<String, Object> prMap(PersonalRecord pr) {
		return Map.of("exercise", pr.exercise(), "weight", pr.weight(), "date", pr.date());
	}

	@SuppressWarnings("unchecked")
	private static List<PersonalRecord> toPrs(DocumentSnapshot doc) {
		List<Map<String, Object>> prs = (List<Map<String, Object>>) doc.get("prs");
		return prs == null ? List.of() : prs.stream()
				.map((pr) -> new PersonalRecord((String) pr.get("exercise"), ((Number) pr.get("weight")).doubleValue(),
						(String) pr.get("date")))
				.toList();
	}

	private static Map<String, Object> sessionMap(String studentId, TrainingSession session) {
		List<Map<String, Object>> exercises = session.exercises().stream().map((exercise) -> {
			List<Map<String, Object>> sets = exercise.sets().stream().map((set) -> {
				Map<String, Object> data = new HashMap<>();
				data.put("weight", set.weight());
				data.put("reps", set.reps());
				if (set.pct() != null) {
					data.put("pct", set.pct());
				}
				return data;
			}).toList();
			Map<String, Object> data = new HashMap<>();
			data.put("name", exercise.name());
			data.put("sets", sets);
			if (exercise.pr() != null) {
				data.put("pr", exercise.pr());
			}
			return data;
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
					Number pr = (Number) exercise.get("pr");
					return new Exercise((String) exercise.get("name"), sets.stream()
							.map((set) -> new ExerciseSet(((Number) set.get("weight")).doubleValue(), intValue(set.get("reps")),
									set.get("pct") == null ? null : intValue(set.get("pct"))))
							.toList(), pr == null ? null : pr.doubleValue());
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
		// 已經在排課時扣過堂（記錄訓練時用來判斷要不要補扣）
		data.put("charged", true);
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
