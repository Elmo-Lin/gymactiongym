package com.example.backend.support;

import com.google.cloud.Timestamp;
import java.time.Instant;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import org.springframework.web.server.ResponseStatusException;

public final class FirestoreSupport {

	private FirestoreSupport() {
	}

	// Firestore client 是非同步 API，這裡的流量很低，直接等結果即可
	public static <T> T await(Future<T> future) {
		try {
			return future.get();
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("Firestore 操作被中斷", ex);
		}
		catch (ExecutionException ex) {
			// transaction 裡丟出的 404、409 等錯誤會被包在其他例外裡，找出來原樣丟出，才會回應正確的狀態碼
			for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
				if (cause instanceof ResponseStatusException status) {
					throw status;
				}
			}
			throw new IllegalStateException("Firestore 操作失敗", ex.getCause());
		}
	}

	public static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos());
	}

}
