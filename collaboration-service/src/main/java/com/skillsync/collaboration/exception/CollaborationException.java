package com.skillsync.collaboration.exception;

public class CollaborationException extends RuntimeException {
    
    public CollaborationException(String message) {
        super(message);
    }

    public CollaborationException(String message, Throwable cause) {
        super(message, cause);
    }
}
