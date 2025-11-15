package com.skillsync.user.specification;

import com.skillsync.user.dto.UserSearchRequest;
import com.skillsync.user.entity.ProficiencyLevel;
import com.skillsync.user.entity.SkillCard;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.entity.Visibility;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserProfileSpecification {

    public static Specification<UserProfile> searchProfiles(UserSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show public profiles in search
            predicates.add(criteriaBuilder.equal(root.get("visibility"), Visibility.PUBLIC));

            // Fuzzy search on username, display name and bio
            if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
                String searchPattern = "%" + request.getQuery().toLowerCase().trim() + "%";
                
                Predicate usernamePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("username"), criteriaBuilder.literal(""))), searchPattern);
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("displayName")), searchPattern);
                Predicate bioPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("bio"), criteriaBuilder.literal(""))), searchPattern);
                
                predicates.add(criteriaBuilder.or(usernamePredicate, namePredicate, bioPredicate));
            }

            // Filter by location
            if (request.getLocation() != null && !request.getLocation().isEmpty()) {
                String locationPattern = "%" + request.getLocation().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")), locationPattern));
            }

            // Filter by skills
            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                Join<UserProfile, SkillCard> skillJoin = root.join("skills", JoinType.INNER);
                
                List<Predicate> skillPredicates = new ArrayList<>();
                for (String skill : request.getSkills()) {
                    String skillPattern = "%" + skill.toLowerCase() + "%";
                    skillPredicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(skillJoin.get("name")), skillPattern));
                }
                
                predicates.add(criteriaBuilder.or(skillPredicates.toArray(new Predicate[0])));

                // Filter by minimum proficiency level if specified
                if (request.getMinProficiencyLevel() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                            skillJoin.get("proficiencyLevel"), request.getMinProficiencyLevel()));
                }

                // Ensure distinct results when joining with skills
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<UserProfile> orderByRelevance(UserSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            // Order by number of matching skills (descending) and then by updated date
            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                query.orderBy(criteriaBuilder.desc(root.get("updatedAt")));
            } else {
                query.orderBy(criteriaBuilder.desc(root.get("updatedAt")));
            }
            return null;
        };
    }
}
