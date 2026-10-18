package com.govjobvault.controller;

import com.govjobvault.dto.ApiResponse;
import com.govjobvault.dto.NotificationResponse;
import com.govjobvault.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications and reminders")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAll(auth.getName())));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(auth.getName())));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(Authentication auth, @PathVariable Long id) {
        notificationService.markAsRead(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
