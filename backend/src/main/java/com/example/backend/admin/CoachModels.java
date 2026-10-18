package com.example.backend.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.List;

// 教練後台（原 coachlog）的資料格式，欄位名稱與前端 frontend/src/admin 相同
public final class CoachModels {

	private CoachModels() {
	}

	static final String DATE = "\\d{4}-\\d{2}-\\d{2}";

	static final String TIME = "\\d{2}:\\d{2}";

	// 訓練內容，需與前端 admin/data.js 的 PLANS 一致
	static final String PLAN = "下肢訓練|上肢訓練|全身訓練";

	// 學生。total 為累計購買堂數，remaining 為剩餘堂數；history 為訓練紀錄（依日期排序）
	// prs 為測驗出來的 PR（依日期排序，保留每一次），記錄訓練時用來換算 %
	// deletedAt 為刪除的時間（台灣時間，例如 2026-10-18T10:37），沒刪除是 null；刪除的學生可以復原
	public record Student(
			String id,
			String name,
			String gender,
			Integer age,
			String goal,
			List<String> plans,
			String phone,
			String note,
			int total,
			int remaining,
			List<TrainingSession> history,
			List<PersonalRecord> prs,
			String deletedAt) {
	}

	// 某個動作的 PR（最大重量）。同一個動作同一天只會有一筆，再輸入一次就會蓋過
	public record PersonalRecord(
			@NotBlank @Size(max = 30) String exercise,
			@Positive @Max(1000) double weight,
			@NotNull @Pattern(regexp = DATE) String date) {
	}

	// 一次訓練紀錄
	public record TrainingSession(
			String id,
			@NotNull @Pattern(regexp = DATE) String date,
			@NotNull @Pattern(regexp = PLAN) String plan,
			@NotNull @Size(max = 20) List<@Valid Exercise> exercises,
			@Size(max = 500) String note) {
	}

	// pr 是記錄當下這個動作的 PR（沒有 PR 的動作是 null），之後 PR 更新了，舊紀錄的 % 仍然正確
	public record Exercise(
			@NotBlank @Size(max = 30) String name,
			@NotEmpty @Size(max = 20) List<@Valid ExerciseSet> sets,
			@Positive @Max(1000) Double pr) {
	}

	// pct 是這組用了 PR 的幾 %（教練指定的數字，重量是換算後四捨五入的結果）；沒有 PR 的動作是 null
	public record ExerciseSet(@PositiveOrZero @Max(1000) double weight, @Min(0) @Max(1000) int reps, @Min(1) @Max(200) Integer pct) {
	}

	// 教練排的課（和客人在網站上的預約分開存）。done 表示已經記錄過訓練
	public record Lesson(String id, String date, String time, String studentId, String plan, boolean done) {
	}

	// 新增或修改學生的基本資料；堂數另外由購買堂數、排課增減
	public record StudentRequest(
			@NotBlank @Size(max = 50) String name,
			@NotNull @Pattern(regexp = "男|女") String gender,
			@Min(1) @Max(120) Integer age,
			@Size(max = 30) String goal,
			@NotEmpty List<@Pattern(regexp = PLAN) String> plans,
			@Size(max = 20) String phone,
			@Size(max = 500) String note) {
	}

	public record PackageRequest(@Min(1) @Max(100) int count) {
	}

	public record PackageResult(int total, int remaining) {
	}

	// 直接修改堂數（按錯 +10 堂、或堂數記錯時修正）。剩餘堂數不能超過累計購買堂數
	public record PackageUpdateRequest(@Min(0) @Max(1000) int total, @Min(0) @Max(1000) int remaining) {
	}

	// 記錄訓練；bookingId 是從排課點進來時對應的那堂課，會一併標記為已記錄
	public record SessionRequest(
			@NotNull @Pattern(regexp = DATE) String date,
			@NotNull @Pattern(regexp = PLAN) String plan,
			@NotEmpty @Size(max = 20) List<@Valid Exercise> exercises,
			@Size(max = 500) String note,
			String bookingId) {
	}

	public record SessionResult(TrainingSession session, int remaining) {
	}

	public record LessonRequest(
			@NotBlank String studentId,
			@NotNull @Pattern(regexp = DATE) String date,
			@NotNull @Pattern(regexp = TIME) String time,
			@NotNull @Pattern(regexp = PLAN) String plan) {
	}

	public record MoveLessonRequest(@NotNull @Pattern(regexp = DATE) String date) {
	}

	// 後台開啟時一次載入的全部資料。exercises 為教練的動作清單，還沒改過時是 null（前端改用預設清單）
	public record AdminData(List<Student> students, List<Lesson> lessons, List<String> exercises) {
	}

	// 儲存教練的動作清單（記錄訓練時「新增動作」的選項）
	public record ExercisesRequest(@NotNull @Size(max = 100) List<@NotBlank @Size(max = 30) String> exercises) {
	}

	// 匯入 coachlog 的示範資料（只有資料庫裡還沒有學生時才允許）
	public record ImportRequest(@NotNull @Size(max = 50) List<Student> students, @NotNull @Size(max = 200) List<Lesson> lessons) {
	}

}
