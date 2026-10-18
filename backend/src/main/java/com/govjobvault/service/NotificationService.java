package com.govjobvault.service;

import com.govjobvault.dto.NotificationResponse;
import com.govjobvault.entity.Notification;
import com.govjobvault.entity.User;
import com.govjobvault.enums.NotificationType;
import com.govjobvault.repository.NotificationRepository;
import com.govjobvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public List<NotificationResponse> getAll(String email) {
        User user = findUser(email);
        return notifRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = findUser(email);
        return notifRepo.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(String email, Long id) {
        User user = findUser(email);
        Notification n = notifRepo.findById(id)
                .filter(notif -> notif.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notifRepo.save(n);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = findUser(email);
        notifRepo.markAllAsRead(user);
    }

    /**
     * Create a notification for a user (used by scheduler and internal services).
     */
    public void createNotification(User user, String title, String message, NotificationType type, Long relatedAppId) {
        Notification n = Notification.builder()
                .user(user).title(title).message(message)
                .type(type).relatedApplicationId(relatedAppId)
                .build();
        notifRepo.save(n);
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .type(n.getType()).isRead(n.isRead())
                .relatedApplicationId(n.getRelatedApplicationId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
