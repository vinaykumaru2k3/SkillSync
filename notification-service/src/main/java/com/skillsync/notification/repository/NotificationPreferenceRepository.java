package com.skillsync.notification.repository;

import com.skillsync.notification.entity.NotificationPreference;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends CrudRepository<NotificationPreference, String> {
    Optional<NotificationPreference> findByUserId(String userId);
}
