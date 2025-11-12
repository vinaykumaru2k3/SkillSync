package com.skillsync.shared.dto;

import java.util.List;

public class ApiError {
    private String code;
    private String message;
    private List<FieldError> details;

    public ApiError() {}

    public ApiError(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public ApiError(String code, String message, List<FieldError> details) {
        this.code = code;
        this.message = message;
        this.details = details;
    }

    // Getters and setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public List<FieldError> getDetails() { return details; }
    public void setDetails(List<FieldError> details) { this.details = details; }

    public static class FieldError {
        private String field;
        private String message;

        public FieldError() {}

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}