package com.govjobvault.dto;

import com.govjobvault.enums.DocumentType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentResponse {
    private Long id;
    private DocumentType type;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    private String downloadUrl;
    private LocalDateTime createdAt;
}
