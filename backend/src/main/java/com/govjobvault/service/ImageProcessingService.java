package com.govjobvault.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class ImageProcessingService {

    /**
     * Resize an image. Supports:
     * - Both width + height → exact resize
     * - Only width → aspect-ratio preserving
     * - Only height → aspect-ratio preserving
     * - maxSizeKB → iterative quality reduction to meet target
     */
    public byte[] resize(byte[] imageBytes, Integer width, Integer height, Integer maxSizeKB) throws IOException {
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (original == null) {
            throw new RuntimeException("Could not read image. Ensure it is a valid JPEG or PNG.");
        }

        int origWidth = original.getWidth();
        int origHeight = original.getHeight();

        // Determine target dimensions with aspect-ratio preservation
        int targetW, targetH;
        if (width != null && height != null) {
            targetW = width;
            targetH = height;
        } else if (width != null) {
            // Preserve aspect ratio based on width
            double ratio = (double) width / origWidth;
            targetW = width;
            targetH = (int) Math.round(origHeight * ratio);
        } else if (height != null) {
            // Preserve aspect ratio based on height
            double ratio = (double) height / origHeight;
            targetW = (int) Math.round(origWidth * ratio);
            targetH = height;
        } else {
            targetW = origWidth;
            targetH = origHeight;
        }

        int effectiveMaxKB = (maxSizeKB != null && maxSizeKB > 0) ? maxSizeKB : 0;

        // First pass: resize to target dimensions at full quality
        byte[] resized = resizeToBytes(imageBytes, targetW, targetH, 1.0);

        // If maxSizeKB specified, iteratively reduce quality
        if (effectiveMaxKB > 0 && resized.length > effectiveMaxKB * 1024L) {
            double quality = 0.9;
            while (quality >= 0.05 && resized.length > effectiveMaxKB * 1024L) {
                resized = resizeToBytes(imageBytes, targetW, targetH, quality);
                log.debug("Quality {}: {} KB", String.format("%.2f", quality), resized.length / 1024);
                quality -= 0.05;
            }
        }

        log.info("Resized image: {}x{} -> {}x{}, {} KB", origWidth, origHeight, targetW, targetH, resized.length / 1024);
        return resized;
    }

    private byte[] resizeToBytes(byte[] imageBytes, int width, int height, double quality) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(imageBytes))
                .size(width, height)
                .keepAspectRatio(false)
                .outputFormat("jpg")
                .outputQuality(quality)
                .toOutputStream(out);
        return out.toByteArray();
    }
}
