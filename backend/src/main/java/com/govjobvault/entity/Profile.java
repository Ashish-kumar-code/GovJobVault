package com.govjobvault.entity;

import com.govjobvault.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ── Profile Identity ──
    @Column(nullable = false)
    private String profileName;          // e.g. "My SSC Profile", "Private Jobs"

    // ── Personal Details ──
    private String fullName;
    private String fatherName;
    private String motherName;
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String category;             // General, OBC, SC, ST, EWS etc.
    private String aadhaarNumber;
    private String phone;
    private String email;

    // ── Address ──
    @Column(columnDefinition = "TEXT")
    private String address;
    private String state;
    private String pincode;

    // ── Document Paths ──
    private String photoPath;
    private String signaturePath;
    private String aadhaarFrontPath;
    private String aadhaarBackPath;

    // ── Education ──
    private String rollNumber;
    private String rollCode;
    private String marks;
    private String board;
    private String passingYear;

    // ── Professional ──
    private String linkedinUrl;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String certificates;

    // ── Other ──
    private String bodyMarks;

    @Builder.Default
    private boolean isDefault = false;

    // ── Timestamps ──
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
