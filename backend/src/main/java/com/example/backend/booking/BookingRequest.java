package com.example.backend.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

// 對應前端預約流程送出的內容。一個時段只屬於這位會員，同行的人是會員自己帶的朋友
public record BookingRequest(
		@NotBlank String planId,
		@NotNull @Pattern(regexp = "single|weekly") String mode,
		// 單次：上課日期；每週固定：第一堂的日期
		@NotNull LocalDate date,
		@NotNull @Pattern(regexp = "\\d{2}:\\d{2}") String time,
		// 只有每週固定需要：4、8 或 12 週
		Integer weeks,
		@NotNull @Valid Contact contact,
		// 同行朋友的姓名，人數必須是方案人數 - 1（1對1 為空陣列）
		@NotNull List<@NotBlank @Size(max = 50) String> partners,
		@NotNull @Pattern(regexp = "muscle|fatloss|posture|fitness|rehab|senior") String goal,
		@NotNull @Pattern(regexp = "none|some|regular") String experience,
		@Size(max = 500) String note) {

	public record Contact(
			@NotBlank @Size(min = 2, max = 50) String name,
			@NotBlank @Pattern(regexp = "09\\d{8}", message = "手機號碼格式應為 09xxxxxxxx") String phone,
			@NotBlank @Email @Size(max = 100) String email) {
	}

}
