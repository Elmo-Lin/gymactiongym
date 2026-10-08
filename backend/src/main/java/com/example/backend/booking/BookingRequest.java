package com.example.backend.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BookingRequest(
		@NotBlank String planId,
		@NotBlank @Size(max = 50) String name,
		@NotBlank @Pattern(regexp = "09\\d{8}", message = "手機號碼格式應為 09xxxxxxxx") String phone,
		@NotBlank @Email String email,
		@Size(max = 500) String note) {
}
