package com.govjobvault.repository;

import com.govjobvault.entity.Profile;
import com.govjobvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findByUserOrderByCreatedAtDesc(User user);

    Optional<Profile> findByIdAndUser(Long id, User user);

    long countByUser(User user);

    @Modifying
    @Query("UPDATE Profile p SET p.isDefault = false WHERE p.user = :user")
    void clearDefaultsForUser(@Param("user") User user);

    Optional<Profile> findByUserAndIsDefaultTrue(User user);
}
