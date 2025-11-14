package com.skillsync.project.specification;

import com.skillsync.project.entity.Project;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class ProjectSpecification {
    
    public static Specification<Project> searchProjects(String searchTerm, Set<String> tags, Set<String> technologies) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Only show public projects in search
            predicates.add(criteriaBuilder.equal(root.get("visibility"), Project.ProjectVisibility.PUBLIC));
            
            // Search by name or description
            if (searchTerm != null && !searchTerm.isEmpty()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, descriptionPredicate));
            }
            
            // Filter by tags
            if (tags != null && !tags.isEmpty()) {
                for (String tag : tags) {
                    predicates.add(criteriaBuilder.isMember(tag, root.get("tags")));
                }
            }
            
            // Filter by technologies
            if (technologies != null && !technologies.isEmpty()) {
                for (String technology : technologies) {
                    predicates.add(criteriaBuilder.isMember(technology, root.get("technologies")));
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
