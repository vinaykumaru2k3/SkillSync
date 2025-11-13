package com.skillsync.user.dto;

import com.skillsync.user.entity.ProficiencyLevel;

import java.util.List;

public class UserSearchRequest {

    private String query;
    private List<String> skills;
    private ProficiencyLevel minProficiencyLevel;
    private String location;
    private int page = 0;
    private int size = 20;

    // Getters and Setters
    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public ProficiencyLevel getMinProficiencyLevel() {
        return minProficiencyLevel;
    }

    public void setMinProficiencyLevel(ProficiencyLevel minProficiencyLevel) {
        this.minProficiencyLevel = minProficiencyLevel;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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
}
