package com.example.backend.support;

import com.google.cloud.Timestamp;
import java.time.Instant;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

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
			throw new IllegalStateException("Firestore 操作失敗", ex.getCause());
		}
	}

	public static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos());
	}

}
