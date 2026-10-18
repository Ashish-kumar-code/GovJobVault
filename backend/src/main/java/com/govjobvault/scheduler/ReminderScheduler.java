package com.govjobvault.scheduler;

import com.govjobvault.entity.JobApplication;
import com.govjobvault.enums.ApplicationStatus;
import com.govjobvault.enums.NotificationType;
import com.govjobvault.repository.JobApplicationRepository;
import com.govjobvault.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final JobApplicationRepository appRepo;
    private final NotificationService notificationService;

    /**
     * Runs daily at 8:00 AM. Creates reminder notifications for:
     * - Exam in 7 days
     * - Exam tomorrow
     * - Exam today (improvement #2)
     * - Admit card date passed but status still APPLIED
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        LocalDate today = LocalDate.now();
        log.info("Running daily reminder scheduler for {}", today);

        // ── Exam in 7 days ──
        List<JobApplication> in7Days = appRepo.findByExamDate(today.plusDays(7));
        for (JobApplication app : in7Days) {
            notificationService.createNotification(
                    app.getUser(),
                    "Exam in 7 days: " + app.getJobTitle(),
                    "Your exam for " + app.getJobTitle() + " (" + app.getDepartment() + ") is in 7 days on " + app.getExamDate() + ".",
                    NotificationType.EXAM,
                    app.getId()
            );
            log.debug("Reminder: exam in 7 days for app {}", app.getId());
        }

        // ── Exam tomorrow ──
        List<JobApplication> tomorrow = appRepo.findByExamDate(today.plusDays(1));
        for (JobApplication app : tomorrow) {
            notificationService.createNotification(
                    app.getUser(),
                    "Exam TOMORROW: " + app.getJobTitle(),
                    "Your exam for " + app.getJobTitle() + " (" + app.getDepartment() + ") is TOMORROW on " + app.getExamDate() + ". Good luck!",
                    NotificationType.EXAM,
                    app.getId()
            );
            log.debug("Reminder: exam tomorrow for app {}", app.getId());
        }

        // ── Exam today (improvement #2) ──
        List<JobApplication> todayExams = appRepo.findByExamDate(today);
        for (JobApplication app : todayExams) {
            notificationService.createNotification(
                    app.getUser(),
                    "Exam TODAY: " + app.getJobTitle(),
                    "Your exam for " + app.getJobTitle() + " (" + app.getDepartment() + ") is TODAY! All the best!",
                    NotificationType.EXAM,
                    app.getId()
            );
            log.debug("Reminder: exam today for app {}", app.getId());
        }

        // ── Admit card date passed, status still APPLIED ──
        List<JobApplication> admitCardPending = appRepo.findByAdmitCardDateLessThanEqualAndStatus(today, ApplicationStatus.APPLIED);
        for (JobApplication app : admitCardPending) {
            notificationService.createNotification(
                    app.getUser(),
                    "Admit Card Reminder: " + app.getJobTitle(),
                    "The admit card date for " + app.getJobTitle() + " has passed. Please check if your admit card is available and update the status.",
                    NotificationType.ADMIT_CARD,
                    app.getId()
            );
            log.debug("Reminder: admit card pending for app {}", app.getId());
        }

        log.info("Daily reminders complete. Created notifications for {} + {} + {} + {} applications",
                in7Days.size(), tomorrow.size(), todayExams.size(), admitCardPending.size());
    }
}
