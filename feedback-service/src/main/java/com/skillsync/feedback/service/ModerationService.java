package com.skillsync.feedback.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class ModerationService {
    private static final List<String> INAPPROPRIATE_WORDS = Arrays.asList(
        "spam", "scam", "fake", "fraud", "abuse"
    );

    public boolean containsInappropriateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }

        String lowerContent = content.toLowerCase();
        return INAPPROPRIATE_WORDS.stream()
            .anyMatch(lowerContent::contains);
    }
}
