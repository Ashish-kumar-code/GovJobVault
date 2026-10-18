package com.govjobvault.repository;

import com.govjobvault.entity.JobApplication;
import com.govjobvault.entity.User;
import com.govjobvault.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserOrderByCreatedAtDesc(User user);

    Optional<JobApplication> findByIdAndUser(Long id, User user);

    @Query("SELECT j FROM JobApplication j WHERE j.user = :user AND j.examDate >= :today AND j.examDate <= :future ORDER BY j.examDate ASC")
    List<JobApplication> findUpcoming(@Param("user") User user, @Param("today") LocalDate today, @Param("future") LocalDate future);

    // Scheduler queries
    List<JobApplication> findByExamDate(LocalDate date);

    List<JobApplication> findByAdmitCardDateLessThanEqualAndStatus(LocalDate date, ApplicationStatus status);
}
