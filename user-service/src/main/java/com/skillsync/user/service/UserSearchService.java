package com.skillsync.user.service;

import com.skillsync.user.dto.UserProfileDto;
import com.skillsync.user.dto.UserSearchRequest;
import com.skillsync.user.dto.UserSearchResponse;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.mapper.UserProfileMapper;
import com.skillsync.user.repository.UserProfileRepository;
import com.skillsync.user.specification.UserProfileSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserSearchService {

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper mapper;

    public UserSearchService(UserProfileRepository userProfileRepository, UserProfileMapper mapper) {
        this.userProfileRepository = userProfileRepository;
        this.mapper = mapper;
    }

    public UserSearchResponse searchProfiles(UserSearchRequest request) {
        Specification<UserProfile> spec = UserProfileSpecification.searchProfiles(request);
        
        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );

        Page<UserProfile> profilePage = userProfileRepository.findAll(spec, pageable);

        List<UserProfileDto> profiles = profilePage.getContent().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        return new UserSearchResponse(
                profiles,
                profilePage.getNumber(),
                profilePage.getSize(),
                profilePage.getTotalElements(),
                profilePage.getTotalPages()
        );
    }

    public List<UserProfileDto> findSimilarProfiles(String skill, int limit) {
        UserSearchRequest request = new UserSearchRequest();
        request.setSkills(List.of(skill));
        request.setSize(limit);
        
        UserSearchResponse response = searchProfiles(request);
        return response.getProfiles();
    }
}
