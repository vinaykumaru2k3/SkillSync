package com.skillsync.notification.service;

import com.skillsync.notification.entity.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@skillsync.com");
            
            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            throw e;
        }
    }
    
    public String buildEmailBody(NotificationType type, String title, String message, String actionUrl) {
        StringBuilder body = new StringBuilder();
        body.append("Hello,\n\n");
        body.append(message).append("\n\n");
        
        if (actionUrl != null && !actionUrl.isEmpty()) {
            body.append("View details: ").append(actionUrl).append("\n\n");
        }
        
        body.append("Best regards,\n");
        body.append("SkillSync Team");
        
        return body.toString();
    }
}
