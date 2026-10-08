package com.example.backend.support;

// 查詢 API 回傳個資時使用，避免編號外流時洩漏完整的聯絡方式
public final class Masking {

	private Masking() {
	}

	// 0912345678 → 0912***678
	public static String phone(String phone) {
		if (phone == null || phone.length() < 8) {
			return "***";
		}
		return phone.substring(0, 4) + "***" + phone.substring(phone.length() - 3);
	}

	// ming@example.com → mi***@example.com
	public static String email(String email) {
		int at = email == null ? -1 : email.indexOf('@');
		if (at <= 0) {
			return "***";
		}
		return email.substring(0, Math.min(2, at)) + "***" + email.substring(at);
	}

}
