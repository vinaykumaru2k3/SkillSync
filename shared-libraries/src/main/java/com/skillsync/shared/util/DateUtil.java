package com.skillsync.shared.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    public static String formatInstant(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.systemDefault()).format(ISO_FORMATTER);
    }
    
    public static Instant parseInstant(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) return null;
        return LocalDateTime.parse(dateString, ISO_FORMATTER)
                .atZone(ZoneId.systemDefault())
                .toInstant();
    }
    
    public static Instant now() {
        return Instant.now();
    }
    
    public static boolean isExpired(Instant expirationTime) {
        return expirationTime != null && expirationTime.isBefore(Instant.now());
    }
}