package com.govjobvault.controller;

import com.govjobvault.dto.*;
import com.govjobvault.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "Profiles", description = "Multi-profile CRUD for job form filling")
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping
    @Operation(summary = "Create a new profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> create(
            Authentication auth, @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile created", profileService.create(auth.getName(), request)));
    }

    @GetMapping
    @Operation(summary = "Get all profiles of the logged-in user")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getAll(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getAllByUser(auth.getName())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single profile by ID")
    public ResponseEntity<ApiResponse<ProfileResponse>> getById(
            Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getById(auth.getName(), id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> update(
            Authentication auth, @PathVariable Long id, @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profileService.update(auth.getName(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a profile")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth, @PathVariable Long id) {
        profileService.delete(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Profile deleted", null));
    }

    @PutMapping("/{id}/set-default")
    @Operation(summary = "Set a profile as the default")
    public ResponseEntity<ApiResponse<ProfileResponse>> setDefault(
            Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Default profile set", profileService.setDefault(auth.getName(), id)));
    }
}
