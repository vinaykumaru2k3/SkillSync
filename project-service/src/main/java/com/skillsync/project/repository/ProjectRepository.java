package com.skillsync.project.repository;

import com.skillsync.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
    
    List<Project> findByOwnerId(UUID ownerId);
    
    List<Project> findByVisibility(Project.ProjectVisibility visibility);
    
    List<Project> findByOwnerIdAndVisibility(UUID ownerId, Project.ProjectVisibility visibility);
}
