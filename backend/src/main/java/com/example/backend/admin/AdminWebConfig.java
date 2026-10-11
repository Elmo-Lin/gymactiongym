package com.example.backend.admin;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 所有 /api/admin/** 都要先通過教練登入檢查
@Configuration
public class AdminWebConfig implements WebMvcConfigurer {

	private final AdminAuthInterceptor adminAuthInterceptor;

	public AdminWebConfig(AdminAuthInterceptor adminAuthInterceptor) {
		this.adminAuthInterceptor = adminAuthInterceptor;
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(adminAuthInterceptor).addPathPatterns("/api/admin/**");
	}

}
