package com.example.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseConfig {

	// 用來驗證教練後台送來的 Firebase ID token（Google 登入）。
	// 憑證沿用 Application Default Credentials：本機用 gcloud 登入，Cloud Run 用服務帳號
	@Bean
	public FirebaseAuth firebaseAuth(@Value("${gcp.project-id}") String projectId) throws IOException {
		FirebaseApp app = FirebaseApp.getApps().isEmpty()
				? FirebaseApp.initializeApp(FirebaseOptions.builder()
						.setProjectId(projectId)
						.setCredentials(GoogleCredentials.getApplicationDefault())
						.build())
				: FirebaseApp.getInstance();
		return FirebaseAuth.getInstance(app);
	}

}
