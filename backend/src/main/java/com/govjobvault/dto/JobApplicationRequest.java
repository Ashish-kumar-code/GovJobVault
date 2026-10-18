package com.govjobvault.dto;

import com.govjobvault.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplicationRequest {

    @NotBlank(message = "Job title is required")
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

    private Long profileId; // Optional link to a profile
}
