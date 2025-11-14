package com.skillsync.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);
        
        // Get the registration ID (github, google, etc.)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        // For GitHub, fetch the primary email
        if ("github".equalsIgnoreCase(registrationId)) {
            return loadGitHubUserWithEmail(userRequest, user);
        }
        
        return user;
    }
    
    private OAuth2User loadGitHubUserWithEmail(OAuth2UserRequest userRequest, OAuth2User user) {
        try {
            // Get the access token
            String accessToken = userRequest.getAccessToken().getTokenValue();
            
            // Fetch emails from GitHub API
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "https://api.github.com/user/emails",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            List<Map<String, Object>> emails = response.getBody();
            
            if (emails != null && !emails.isEmpty()) {
                // Find the primary verified email
                String primaryEmail = null;
                for (Map<String, Object> emailData : emails) {
                    Boolean primary = (Boolean) emailData.get("primary");
                    Boolean verified = (Boolean) emailData.get("verified");
                    String email = (String) emailData.get("email");
                    
                    logger.info("GitHub email found: {} (primary: {}, verified: {})", email, primary, verified);
                    
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                        primaryEmail = email;
                        break;
                    }
                }
                
                // If no primary email, use the first verified one
                if (primaryEmail == null) {
                    for (Map<String, Object> emailData : emails) {
                        Boolean verified = (Boolean) emailData.get("verified");
                        String email = (String) emailData.get("email");
                        
                        if (Boolean.TRUE.equals(verified)) {
                            primaryEmail = email;
                            break;
                        }
                    }
                }
                
                // Add email to user attributes
                if (primaryEmail != null) {
                    Map<String, Object> attributes = new HashMap<>(user.getAttributes());
                    attributes.put("email", primaryEmail);
                    
                    logger.info("Using GitHub email: {}", primaryEmail);
                    
                    Set<GrantedAuthority> authorities = new HashSet<>(user.getAuthorities());
                    
                    return new DefaultOAuth2User(
                        authorities,
                        attributes,
                        "login"
                    );
                }
            }
            
            logger.warn("No verified email found for GitHub user");
            
        } catch (Exception e) {
            logger.error("Error fetching GitHub user emails", e);
        }
        
        return user;
    }
}
