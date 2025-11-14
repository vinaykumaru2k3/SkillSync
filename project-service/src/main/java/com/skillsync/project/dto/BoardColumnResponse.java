package com.skillsync.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardColumnResponse {
    
    private UUID id;
    private String name;
    private Integer position;
    private List<TaskResponse> tasks;
}
