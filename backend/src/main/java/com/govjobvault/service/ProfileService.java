package com.govjobvault.service;

import com.govjobvault.dto.ProfileRequest;
import com.govjobvault.dto.ProfileResponse;
import com.govjobvault.entity.Profile;
import com.govjobvault.entity.User;
import com.govjobvault.repository.ProfileRepository;
import com.govjobvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProfileResponse create(String email, ProfileRequest request) {
        User user = findUser(email);

        Profile profile = mapToEntity(request);
        profile.setUser(user);

        // First profile is automatically the default
        if (profileRepository.countByUser(user) == 0) {
            profile.setDefault(true);
        }

        profile = profileRepository.save(profile);
        return mapToResponse(profile);
    }

    public List<ProfileResponse> getAllByUser(String email) {
        User user = findUser(email);
        return profileRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ProfileResponse getById(String email, Long id) {
        User user = findUser(email);
        Profile profile = profileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse update(String email, Long id, ProfileRequest request) {
        User user = findUser(email);
        Profile profile = profileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        updateEntity(profile, request);
        profile = profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        Profile profile = profileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        boolean wasDefault = profile.isDefault();
        profileRepository.delete(profile);

        // If deleted profile was default, assign default to the most recent remaining
        if (wasDefault) {
            List<Profile> remaining = profileRepository.findByUserOrderByCreatedAtDesc(user);
            if (!remaining.isEmpty()) {
                remaining.get(0).setDefault(true);
                profileRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public ProfileResponse setDefault(String email, Long id) {
        User user = findUser(email);
        Profile profile = profileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        // Clear all defaults, then set this one
        profileRepository.clearDefaultsForUser(user);
        profile.setDefault(true);
        profile = profileRepository.save(profile);
        return mapToResponse(profile);
    }

    // ── Helpers ──

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Profile mapToEntity(ProfileRequest r) {
        return Profile.builder()
                .profileName(r.getProfileName())
                .fullName(r.getFullName()).fatherName(r.getFatherName()).motherName(r.getMotherName())
                .dateOfBirth(r.getDateOfBirth()).gender(r.getGender()).category(r.getCategory())
                .aadhaarNumber(r.getAadhaarNumber()).phone(r.getPhone()).email(r.getEmail())
                .address(r.getAddress()).state(r.getState()).pincode(r.getPincode())
                .photoPath(r.getPhotoPath()).signaturePath(r.getSignaturePath())
                .aadhaarFrontPath(r.getAadhaarFrontPath()).aadhaarBackPath(r.getAadhaarBackPath())
                .rollNumber(r.getRollNumber()).rollCode(r.getRollCode())
                .marks(r.getMarks()).board(r.getBoard()).passingYear(r.getPassingYear())
                .linkedinUrl(r.getLinkedinUrl()).skills(r.getSkills()).certificates(r.getCertificates())
                .bodyMarks(r.getBodyMarks())
                .build();
    }

    private void updateEntity(Profile p, ProfileRequest r) {
        p.setProfileName(r.getProfileName());
        p.setFullName(r.getFullName()); p.setFatherName(r.getFatherName()); p.setMotherName(r.getMotherName());
        p.setDateOfBirth(r.getDateOfBirth()); p.setGender(r.getGender()); p.setCategory(r.getCategory());
        p.setAadhaarNumber(r.getAadhaarNumber()); p.setPhone(r.getPhone()); p.setEmail(r.getEmail());
        p.setAddress(r.getAddress()); p.setState(r.getState()); p.setPincode(r.getPincode());
        p.setPhotoPath(r.getPhotoPath()); p.setSignaturePath(r.getSignaturePath());
        p.setAadhaarFrontPath(r.getAadhaarFrontPath()); p.setAadhaarBackPath(r.getAadhaarBackPath());
        p.setRollNumber(r.getRollNumber()); p.setRollCode(r.getRollCode());
        p.setMarks(r.getMarks()); p.setBoard(r.getBoard()); p.setPassingYear(r.getPassingYear());
        p.setLinkedinUrl(r.getLinkedinUrl()); p.setSkills(r.getSkills()); p.setCertificates(r.getCertificates());
        p.setBodyMarks(r.getBodyMarks());
    }

    private ProfileResponse mapToResponse(Profile p) {
        return ProfileResponse.builder()
                .id(p.getId()).profileName(p.getProfileName())
                .fullName(p.getFullName()).fatherName(p.getFatherName()).motherName(p.getMotherName())
                .dateOfBirth(p.getDateOfBirth()).gender(p.getGender()).category(p.getCategory())
                .aadhaarNumber(p.getAadhaarNumber()).phone(p.getPhone()).email(p.getEmail())
                .address(p.getAddress()).state(p.getState()).pincode(p.getPincode())
                .photoPath(p.getPhotoPath()).signaturePath(p.getSignaturePath())
                .aadhaarFrontPath(p.getAadhaarFrontPath()).aadhaarBackPath(p.getAadhaarBackPath())
                .rollNumber(p.getRollNumber()).rollCode(p.getRollCode())
                .marks(p.getMarks()).board(p.getBoard()).passingYear(p.getPassingYear())
                .linkedinUrl(p.getLinkedinUrl()).skills(p.getSkills()).certificates(p.getCertificates())
                .bodyMarks(p.getBodyMarks()).isDefault(p.isDefault())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }
}
