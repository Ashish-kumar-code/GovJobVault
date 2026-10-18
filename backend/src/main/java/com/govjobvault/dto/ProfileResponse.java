package com.govjobvault.dto;

import com.govjobvault.enums.Gender;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileResponse {

    private Long id;
    private String profileName;

    // Personal
    private String fullName;
    private String fatherName;
    private String motherName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String category;
    private String aadhaarNumber;
    private String phone;
    private String email;

    // Address
    private String address;
    private String state;
    private String pincode;

    // Document paths
    private String photoPath;
    private String signaturePath;
    private String aadhaarFrontPath;
    private String aadhaarBackPath;

    // Education
    private String rollNumber;
    private String rollCode;
    private String marks;
    private String board;
    private String passingYear;

    // Professional
    private String linkedinUrl;
    private String skills;
    private String certificates;

    // Other
    private String bodyMarks;
    private boolean isDefault;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
