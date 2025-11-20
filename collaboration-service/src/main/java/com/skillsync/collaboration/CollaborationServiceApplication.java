package com.skillsync.collaboration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling

@ComponentScan(basePackages = { "com.skillsync.collaboration", "com.skillsync.shared" })
public class CollaborationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CollaborationServiceApplication.class, args);
    }
}