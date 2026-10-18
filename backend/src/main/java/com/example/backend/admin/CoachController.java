package com.example.backend.admin;

import org.springframework.web.server.ResponseStatusException;

import org.springframework.web.bind.annotation.RequestParam;

import com.example.backend.schedule.Plan;

import com.example.backend.admin.CoachModels.AdminData;
import com.example.backend.admin.CoachModels.ExercisesRequest;
import com.example.backend.admin.CoachModels.ImportRequest;
import com.example.backend.admin.CoachModels.Lesson;
import com.example.backend.admin.CoachModels.LessonRequest;
import com.example.backend.admin.CoachModels.MoveLessonRequest;
import com.example.backend.admin.CoachModels.PackageRequest;
import com.example.backend.admin.CoachModels.PackageResult;
import com.example.backend.admin.CoachModels.PackageUpdateRequest;
import com.example.backend.admin.CoachModels.PersonalRecord;
import com.example.backend.admin.CoachModels.SessionRequest;
import com.example.backend.admin.CoachModels.SessionResult;
import com.example.backend.admin.CoachModels.Student;
import com.example.backend.admin.CoachModels.StudentRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// 教練後台的 API。所有請求都要先通過 AdminAuthInterceptor 的登入檢查
@RestController
@RequestMapping("/api/admin")
public class CoachController {

	private final CoachRepository coachRepository;

	public CoachController(CoachRepository coachRepository) {
		this.coachRepository = coachRepository;
	}

	// 後台開啟時一次載入：學生（含訓練紀錄）與排課
	@GetMapping("/data")
	public AdminData data() {
		return coachRepository.load();
	}

	@PostMapping("/import")
	public AdminData importDemo(@Valid @RequestBody ImportRequest request) {
		return coachRepository.importDemo(request);
	}

	@PostMapping("/students")
	@ResponseStatus(HttpStatus.CREATED)
	public Student createStudent(@Valid @RequestBody StudentRequest request) {
		return coachRepository.createStudent(request);
	}

	@PutMapping("/students/{id}")
	public Student updateStudent(@PathVariable String id, @Valid @RequestBody StudentRequest request) {
		return coachRepository.updateStudent(id, request);
	}

	// 刪除（可以復原），回傳刪除的時間
	@DeleteMapping("/students/{id}")
	public Map<String, String> deleteStudent(@PathVariable String id) {
		return Map.of("deletedAt", coachRepository.deleteStudent(id));
	}

	@PostMapping("/students/{id}/restore")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void restoreStudent(@PathVariable String id) {
		coachRepository.restoreStudent(id);
	}

	// 永久刪除已刪除的學生，連同訓練紀錄與排課，無法復原
	@DeleteMapping("/students/{id}/permanent")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void purgeStudent(@PathVariable String id) {
		coachRepository.purgeStudent(id);
	}

	@PostMapping("/students/{id}/packages")
	public PackageResult addPackage(@PathVariable String id, @Valid @RequestBody PackageRequest request) {
		return coachRepository.addPackage(id, request.count());
	}

	@PostMapping("/students/{id}/prs")
	public List<PersonalRecord> savePr(@PathVariable String id, @Valid @RequestBody PersonalRecord request) {
		return coachRepository.savePr(id, request);
	}

	@PutMapping("/students/{id}/package")
	public PackageResult setPackage(@PathVariable String id, @Valid @RequestBody PackageUpdateRequest request) {
		return coachRepository.setPackage(id, request.total(), request.remaining());
	}

	@PostMapping("/students/{id}/sessions")
	@ResponseStatus(HttpStatus.CREATED)
	public SessionResult logSession(@PathVariable String id, @Valid @RequestBody SessionRequest request) {
		return coachRepository.logSession(id, request);
	}

	@PostMapping("/lessons")
	@ResponseStatus(HttpStatus.CREATED)
	public Lesson addLesson(@Valid @RequestBody LessonRequest request) {
		return coachRepository.addLesson(request);
	}

	// 例如 PUT /api/admin/exercises?program=pilates；沒有 program 時是健身的動作清單
	@PutMapping("/exercises")
	public List<String> saveExercises(@Valid @RequestBody ExercisesRequest request,
			@RequestParam(defaultValue = Plan.FITNESS) String program) {
		if (!Plan.PROGRAMS.contains(program)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "找不到這個課程類別");
		}
		return coachRepository.saveExercises(program, request.exercises());
	}

	@PatchMapping("/lessons/{id}")
	public Lesson moveLesson(@PathVariable String id, @Valid @RequestBody MoveLessonRequest request) {
		return coachRepository.moveLesson(id, request.date());
	}

	@DeleteMapping("/lessons/{id}")
	public Map<String, Integer> deleteLesson(@PathVariable String id) {
		return Map.of("remaining", coachRepository.deleteLesson(id));
	}

}
