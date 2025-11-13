package com.skillsync.user.repository;

import com.skillsync.user.entity.SkillCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillCardRepository extends JpaRepository<SkillCard, UUID> {
    
    List<SkillCard> findByUserProfileId(UUID userProfileId);
}
