package com.example.backend.support;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class ReferenceGenerator {

	private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

	private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyMMdd");

	private static final ZoneId TAIPEI = ZoneId.of("Asia/Taipei");

	private static final SecureRandom RANDOM = new SecureRandom();

	private ReferenceGenerator() {
	}

	// 前綴 + 日期 + 兩組 4 碼亂數，例如 OD261008-X7K2-9QPM。
	// 查詢只需要編號，亂數要夠長才不會被逐一猜中（32^8 ≈ 1 兆種組合）
	public static String generate(String prefix) {
		StringBuilder code = new StringBuilder(prefix).append(LocalDate.now(TAIPEI).format(CODE_DATE));
		for (int group = 0; group < 2; group++) {
			code.append('-');
			for (int i = 0; i < 4; i++) {
				code.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
			}
		}
		return code.toString();
	}

}
