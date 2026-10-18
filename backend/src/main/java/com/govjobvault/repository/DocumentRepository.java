package com.govjobvault.repository;

import com.govjobvault.entity.Document;
import com.govjobvault.entity.Profile;
import com.govjobvault.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProfileOrderByCreatedAtDesc(Profile profile);
    Optional<Document> findByProfileAndType(Profile profile, DocumentType type);
}
