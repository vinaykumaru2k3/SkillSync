package com.skillsync.user.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class SupabaseConfig {

    @Value("${supabase.url:https://ymihlmgnwmmbjlyaxzii.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Bean
    public WebClient supabaseWebClient() {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(supabaseUrl);
        
        if (supabaseKey != null && !supabaseKey.isEmpty()) {
            builder.defaultHeader("apikey", supabaseKey)
                   .defaultHeader("Authorization", "Bearer " + supabaseKey);
        }
        
        return builder.build();
    }
}
