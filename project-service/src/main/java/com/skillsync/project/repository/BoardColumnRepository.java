package com.skillsync.project.repository;

import com.skillsync.project.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
    
    List<BoardColumn> findByProjectIdOrderByPositionAsc(UUID projectId);
}
