package com.example.backend.config;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class FirestoreConfig {

	// 有設定 app.firestore.emulator-host 時連本機模擬器；空白時連雲端，
	// 憑證走 Application Default Credentials（本機用 gcloud 登入，Cloud Run 用服務帳號）。
	@Bean(destroyMethod = "close")
	public Firestore firestore(@Value("${gcp.project-id}") String projectId,
			@Value("${app.firestore.emulator-host:}") String emulatorHost) {
		FirestoreOptions.Builder builder = FirestoreOptions.newBuilder().setProjectId(projectId);
		if (StringUtils.hasText(emulatorHost)) {
			builder.setEmulatorHost(emulatorHost);
		}
		return builder.build().getService();
	}

}
