package com.skillsync.collaboration.dto;

public class InvitationResponse {
    private String message;
    private CollaborationDTO collaboration;

    public InvitationResponse() {}

    public InvitationResponse(String message, CollaborationDTO collaboration) {
        this.message = message;
        this.collaboration = collaboration;
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public CollaborationDTO getCollaboration() {
        return collaboration;
    }

    public void setCollaboration(CollaborationDTO collaboration) {
        this.collaboration = collaboration;
    }
}
