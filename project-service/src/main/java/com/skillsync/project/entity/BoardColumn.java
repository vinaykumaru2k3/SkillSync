package com.skillsync.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "board_columns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardColumn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Integer position;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Task> tasks = new ArrayList<>();
    
    public void addTask(Task task) {
        tasks.add(task);
        task.setColumn(this);
    }
    
    public void removeTask(Task task) {
        tasks.remove(task);
        task.setColumn(null);
    }
}
