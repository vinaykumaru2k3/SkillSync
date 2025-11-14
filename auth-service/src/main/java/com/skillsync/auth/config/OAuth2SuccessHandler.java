package com.skillsync.auth.config;

import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.service.OAuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);
    
    private final OAuthService oAuthService;
    
    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public OAuth2SuccessHandler(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            logger.info("OAuth2 authentication successful for user: {}", oAuth2User.getAttributes());
            
            // Process OAuth login and get tokens
            AuthResponse authResponse = oAuthService.processOAuthLogin(oAuth2User, "github");
            
            // Redirect to frontend with tokens as URL parameters
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                    .queryParam("accessToken", authResponse.getAccessToken())
                    .queryParam("refreshToken", authResponse.getRefreshToken())
                    .queryParam("userId", authResponse.getUserId())
                    .queryParam("email", authResponse.getEmail())
                    .build()
                    .toUriString();
            
            logger.info("Redirecting to frontend callback with tokens");
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            
        } catch (IllegalArgumentException e) {
            logger.error("OAuth validation error: {}", e.getMessage());
            String errorUrl = frontendUrl + "/login?error=oauth_failed&message=" + e.getMessage();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        } catch (Exception e) {
            logger.error("Error during OAuth success handling", e);
            String errorUrl = frontendUrl + "/login?error=oauth_failed&message=unexpected_error";
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}
