package com.skillsync.user.dto;

import java.util.List;

public class UserSearchResponse {

    private List<UserProfileDto> profiles;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public UserSearchResponse(List<UserProfileDto> profiles, int page, int size, long totalElements, int totalPages) {
        this.profiles = profiles;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public List<UserProfileDto> getProfiles() {
        return profiles;
    }

    public void setProfiles(List<UserProfileDto> profiles) {
        this.profiles = profiles;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
