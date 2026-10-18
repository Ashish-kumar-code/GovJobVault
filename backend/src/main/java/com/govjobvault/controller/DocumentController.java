package com.govjobvault.controller;

import com.govjobvault.dto.ApiResponse;
import com.govjobvault.dto.DocumentResponse;
import com.govjobvault.entity.Document;
import com.govjobvault.entity.Profile;
import com.govjobvault.entity.User;
import com.govjobvault.enums.DocumentType;
import com.govjobvault.repository.DocumentRepository;
import com.govjobvault.repository.ProfileRepository;
import com.govjobvault.repository.UserRepository;
import com.govjobvault.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profiles/{profileId}/documents")
@RequiredArgsConstructor
@Tag(name = "Profile Documents", description = "Upload/download documents linked to profiles")
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Upload a document to a profile")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            Authentication auth,
            @PathVariable Long profileId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") DocumentType type) throws IOException {

        Profile profile = getProfileForUser(auth.getName(), profileId);

        // Store file
        String storedName = fileStorageService.store(file);
        String fullPath = fileStorageService.getFullPath(storedName);

        // Delete old file if re-uploading same type
        documentRepository.findByProfileAndType(profile, type).ifPresent(old -> {
            fileStorageService.delete(old.getStoredFileName());
            documentRepository.delete(old);
        });

        // Save document record
        Document doc = Document.builder()
                .profile(profile).type(type)
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedName).filePath(fullPath)
                .fileSize(file.getSize()).contentType(file.getContentType())
                .build();
        doc = documentRepository.save(doc);

        // Update corresponding path field in Profile
        switch (type) {
            case PHOTO -> profile.setPhotoPath(storedName);
            case SIGNATURE -> profile.setSignaturePath(storedName);
            case AADHAAR_FRONT -> profile.setAadhaarFrontPath(storedName);
            case AADHAAR_BACK -> profile.setAadhaarBackPath(storedName);
            default -> {} // COMBINED, RESIZED don't map to profile fields
        }
        profileRepository.save(profile);

        return ResponseEntity.ok(ApiResponse.success("Document uploaded", toResponse(doc, profileId)));
    }

    @GetMapping
    @Operation(summary = "List all documents for a profile")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> listAll(
            Authentication auth, @PathVariable Long profileId) {
        Profile profile = getProfileForUser(auth.getName(), profileId);
        List<DocumentResponse> docs = documentRepository.findByProfileOrderByCreatedAtDesc(profile)
                .stream().map(d -> toResponse(d, profileId)).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(docs));
    }

    @GetMapping("/{type}/download")
    @Operation(summary = "Download a document by type")
    public ResponseEntity<Resource> download(
            Authentication auth,
            @PathVariable Long profileId,
            @PathVariable DocumentType type) {

        Profile profile = getProfileForUser(auth.getName(), profileId);
        Document doc = documentRepository.findByProfileAndType(profile, type)
                .orElseThrow(() -> new RuntimeException("No " + type + " document found for this profile"));

        Resource resource = fileStorageService.load(doc.getStoredFileName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType() != null ? doc.getContentType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFileName() + "\"")
                .body(resource);
    }

    // ── Helpers ──

    private Profile getProfileForUser(String email, Long profileId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return profileRepository.findByIdAndUser(profileId, user)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));
    }

    private DocumentResponse toResponse(Document doc, Long profileId) {
        return DocumentResponse.builder()
                .id(doc.getId()).type(doc.getType())
                .originalFileName(doc.getOriginalFileName())
                .fileSize(doc.getFileSize()).contentType(doc.getContentType())
                .downloadUrl("/api/profiles/" + profileId + "/documents/" + doc.getType() + "/download")
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
