package com.govjobvault.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            log.info("Upload directory ready: {}", uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    /**
     * Stores a file with a UUID name. Returns the stored filename (not full path).
     */
    public String store(MultipartFile file) throws IOException {
        validateImageType(file);

        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + ext;

        Path target = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        log.debug("Stored file: {} -> {}", originalName, storedName);
        return storedName;
    }

    /**
     * Loads a file as a Resource for download.
     */
    public Resource load(String storedFileName) {
        try {
            Path filePath = uploadPath.resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + storedFileName);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + storedFileName, e);
        }
    }

    /**
     * Deletes a file from disk.
     */
    public void delete(String storedFileName) {
        try {
            Path filePath = uploadPath.resolve(storedFileName).normalize();
            Files.deleteIfExists(filePath);
            log.debug("Deleted file: {}", storedFileName);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", storedFileName, e);
        }
    }

    /**
     * Returns the full filesystem path for a stored file.
     */
    public String getFullPath(String storedFileName) {
        return uploadPath.resolve(storedFileName).toString();
    }

    private void validateImageType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Only JPEG and PNG images are allowed. Got: " + contentType);
        }
    }

    private String getExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return ".jpg";
    }
}
