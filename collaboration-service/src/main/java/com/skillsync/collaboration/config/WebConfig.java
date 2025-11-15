package com.skillsync.collaboration.config;

import com.skillsync.collaboration.security.PermissionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private PermissionInterceptor permissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(permissionInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns(
                        "/api/v1/collaborations/invites",
                        "/api/v1/collaborations/invites/*/accept",
                        "/api/v1/collaborations/invites/*/decline",
                        "/api/v1/collaborations/invites/pending",
                        "/api/v1/collaborations/invites/sent"
                );
    }
}
