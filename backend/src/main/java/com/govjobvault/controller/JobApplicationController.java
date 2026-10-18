package com.govjobvault.controller;

import com.govjobvault.dto.*;
import com.govjobvault.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Job Applications", description = "Track government and private job applications")
public class JobApplicationController {

    private final JobApplicationService appService;

    @PostMapping
    @Operation(summary = "Create a new job application")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> create(
            Authentication auth, @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application created", appService.create(auth.getName(), request)));
    }

    @GetMapping
    @Operation(summary = "List all applications of the logged-in user")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getAll(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(appService.getAll(auth.getName())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single application")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> getById(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appService.getById(auth.getName(), id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an application")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> update(
            Authentication auth, @PathVariable Long id, @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application updated", appService.update(auth.getName(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an application")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        appService.delete(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Application deleted", null));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get applications with exams in the next 30 days")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getUpcoming(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(appService.getUpcoming(auth.getName())));
    }
}
