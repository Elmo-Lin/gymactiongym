package com.example.backend.admin;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

// 保護 /api/admin/**：必須帶著 Google 登入的 Firebase ID token，而且 Email 在允許名單裡。
//   沒有 token 或 token 無效 → 401；登入了但不是允許的帳號 → 403
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

	private final FirebaseAuth firebaseAuth;

	private final Set<String> allowedEmails;

	public AdminAuthInterceptor(FirebaseAuth firebaseAuth, @Value("${app.admin.emails:}") String[] emails) {
		this.firebaseAuth = firebaseAuth;
		this.allowedEmails = Arrays.stream(emails)
				.map((email) -> email.trim().toLowerCase())
				.filter((email) -> !email.isEmpty())
				.collect(Collectors.toUnmodifiableSet());
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		// 瀏覽器跨網域呼叫前的 OPTIONS 詢問不會帶 token，交給 CORS 設定處理
		if (CorsUtils.isPreFlightRequest(request)) {
			return true;
		}

		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header == null || !header.startsWith("Bearer ")) {
			return reject(response, HttpStatus.UNAUTHORIZED);
		}

		FirebaseToken token;
		try {
			token = firebaseAuth.verifyIdToken(header.substring("Bearer ".length()));
		}
		catch (FirebaseAuthException | IllegalArgumentException ex) {
			return reject(response, HttpStatus.UNAUTHORIZED);
		}

		String email = token.getEmail();
		if (email == null || !token.isEmailVerified() || !allowedEmails.contains(email.toLowerCase())) {
			return reject(response, HttpStatus.FORBIDDEN);
		}
		return true;
	}

	// 只設定狀態碼、不轉到錯誤頁，CORS 標頭才會保留，前端讀得到 401／403
	private static boolean reject(HttpServletResponse response, HttpStatus status) {
		response.setStatus(status.value());
		return false;
	}

}
