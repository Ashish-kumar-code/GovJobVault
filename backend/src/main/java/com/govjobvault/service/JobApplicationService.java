package com.govjobvault.service;

import com.govjobvault.dto.JobApplicationRequest;
import com.govjobvault.dto.JobApplicationResponse;
import com.govjobvault.entity.JobApplication;
import com.govjobvault.entity.Profile;
import com.govjobvault.entity.User;
import com.govjobvault.enums.ApplicationStatus;
import com.govjobvault.repository.JobApplicationRepository;
import com.govjobvault.repository.ProfileRepository;
import com.govjobvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository appRepo;
    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;

    public JobApplicationResponse create(String email, JobApplicationRequest req) {
        User user = findUser(email);

        JobApplication app = JobApplication.builder()
                .user(user)
                .jobTitle(req.getJobTitle())
                .department(req.getDepartment())
                .postName(req.getPostName())
                .applicationId(req.getApplicationId())
                .applicationDate(req.getApplicationDate())
                .examDate(req.getExamDate())
                .admitCardDate(req.getAdmitCardDate())
                .resultDate(req.getResultDate())
                .status(req.getStatus() != null ? req.getStatus() : ApplicationStatus.APPLIED)
                .officialLink(req.getOfficialLink())
                .notes(req.getNotes())
                .build();

        // Link optional profile (improvement #1)
        if (req.getProfileId() != null) {
            Profile profile = profileRepo.findByIdAndUser(req.getProfileId(), user)
                    .orElse(null);
            app.setProfile(profile);
        }

        app = appRepo.save(app);
        return toResponse(app);
    }

    public List<JobApplicationResponse> getAll(String email) {
        User user = findUser(email);
        return appRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public JobApplicationResponse getById(String email, Long id) {
        User user = findUser(email);
        JobApplication app = appRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        return toResponse(app);
    }

    public JobApplicationResponse update(String email, Long id, JobApplicationRequest req) {
        User user = findUser(email);
        JobApplication app = appRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        app.setJobTitle(req.getJobTitle());
        app.setDepartment(req.getDepartment());
        app.setPostName(req.getPostName());
        app.setApplicationId(req.getApplicationId());
        app.setApplicationDate(req.getApplicationDate());
        app.setExamDate(req.getExamDate());
        app.setAdmitCardDate(req.getAdmitCardDate());
        app.setResultDate(req.getResultDate());
        if (req.getStatus() != null) app.setStatus(req.getStatus());
        app.setOfficialLink(req.getOfficialLink());
        app.setNotes(req.getNotes());

        if (req.getProfileId() != null) {
            Profile profile = profileRepo.findByIdAndUser(req.getProfileId(), user).orElse(null);
            app.setProfile(profile);
        }

        app = appRepo.save(app);
        return toResponse(app);
    }

    public void delete(String email, Long id) {
        User user = findUser(email);
        JobApplication app = appRepo.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        appRepo.delete(app);
    }

    public List<JobApplicationResponse> getUpcoming(String email) {
        User user = findUser(email);
        LocalDate today = LocalDate.now();
        LocalDate future = today.plusDays(30);
        return appRepo.findUpcoming(user, today, future)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ──

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private JobApplicationResponse toResponse(JobApplication a) {
        return JobApplicationResponse.builder()
                .id(a.getId()).jobTitle(a.getJobTitle())
                .department(a.getDepartment()).postName(a.getPostName())
                .applicationId(a.getApplicationId())
                .applicationDate(a.getApplicationDate())
                .examDate(a.getExamDate()).admitCardDate(a.getAdmitCardDate())
                .resultDate(a.getResultDate()).status(a.getStatus())
                .officialLink(a.getOfficialLink()).notes(a.getNotes())
                .profileId(a.getProfile() != null ? a.getProfile().getId() : null)
                .profileName(a.getProfile() != null ? a.getProfile().getProfileName() : null)
                .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .build();
    }
}
