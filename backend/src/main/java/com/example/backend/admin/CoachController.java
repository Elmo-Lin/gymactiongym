package com.example.backend.admin;

import com.example.backend.admin.CoachModels.AdminData;
import com.example.backend.admin.CoachModels.ExercisesRequest;
import com.example.backend.admin.CoachModels.ImportRequest;
import com.example.backend.admin.CoachModels.Lesson;
import com.example.backend.admin.CoachModels.LessonRequest;
import com.example.backend.admin.CoachModels.MoveLessonRequest;
import com.example.backend.admin.CoachModels.PackageRequest;
import com.example.backend.admin.CoachModels.PackageResult;
import com.example.backend.admin.CoachModels.PersonalRecord;
import com.example.backend.admin.CoachModels.SessionRequest;
import com.example.backend.admin.CoachModels.SessionResult;
import com.example.backend.admin.CoachModels.Student;
import com.example.backend.admin.CoachModels.StudentRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
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

	@PostMapping("/students/{id}/packages")
	public PackageResult addPackage(@PathVariable String id, @Valid @RequestBody PackageRequest request) {
		return coachRepository.addPackage(id, request.count());
	}

	@PostMapping("/students/{id}/prs")
	public List<PersonalRecord> savePr(@PathVariable String id, @Valid @RequestBody PersonalRecord request) {
		return coachRepository.savePr(id, request);
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

	@PutMapping("/exercises")
	public List<String> saveExercises(@Valid @RequestBody ExercisesRequest request) {
		return coachRepository.saveExercises(request.exercises());
	}

	@PatchMapping("/lessons/{id}")
	public Lesson moveLesson(@PathVariable String id, @Valid @RequestBody MoveLessonRequest request) {
		return coachRepository.moveLesson(id, request.date());
	}

}
