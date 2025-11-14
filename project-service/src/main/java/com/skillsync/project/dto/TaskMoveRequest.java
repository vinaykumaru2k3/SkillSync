package com.skillsync.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskMoveRequest {
    
    @NotNull(message = "Target column ID is required")
    private UUID targetColumnId;
    
    @NotNull(message = "Position is required")
    private Integer position;
}
