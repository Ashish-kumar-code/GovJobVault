package com.govjobvault.dto;

import com.govjobvault.enums.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private Long relatedApplicationId;
    private LocalDateTime createdAt;
}
