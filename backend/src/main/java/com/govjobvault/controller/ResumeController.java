package com.govjobvault.controller;

import com.govjobvault.entity.Profile;
import com.govjobvault.entity.User;
import com.govjobvault.repository.ProfileRepository;
import com.govjobvault.repository.UserRepository;
import com.govjobvault.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@Tag(name = "Resume", description = "Generate PDF resume from profile data")
public class ResumeController {

    private final ResumeService resumeService;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @PostMapping("/generate")
    @Operation(summary = "Generate a PDF resume from a profile")
    public ResponseEntity<byte[]> generate(
            Authentication auth,
            @RequestBody Map<String, Long> request) {

        Long profileId = request.get("profileId");
        if (profileId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Find user
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find profile — must belong to logged-in user (improvement #4)
        Profile profile = profileRepository.findByIdAndUser(profileId, user)
                .orElse(null);

        if (profile == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body("{\"success\":false,\"message\":\"Profile not found or access denied\"}".getBytes());
        }

        // Generate PDF
        byte[] pdf = resumeService.generateResume(profile);

        String filename = (profile.getFullName() != null ? profile.getFullName() : profile.getProfileName())
                .replaceAll("[^a-zA-Z0-9]", "_") + "_Resume.pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(pdf.length)
                .body(pdf);
    }
}
