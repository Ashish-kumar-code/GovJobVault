package com.govjobvault.dto;

import com.govjobvault.enums.ApplicationStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplicationResponse {

    private Long id;
    private String jobTitle;
    private String department;
    private String postName;
    private String applicationId;
    private LocalDate applicationDate;
    private LocalDate examDate;
    private LocalDate admitCardDate;
    private LocalDate resultDate;
    private ApplicationStatus status;
    private String officialLink;
    private String notes;

    // Profile info (if linked)
    private Long profileId;
    private String profileName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
