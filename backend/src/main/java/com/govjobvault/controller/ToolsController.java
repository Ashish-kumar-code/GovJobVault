package com.govjobvault.controller;

import com.govjobvault.service.AadhaarCombinerService;
import com.govjobvault.service.ImageProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
@Tag(name = "Tools", description = "Image resize and Aadhaar combiner utilities")
public class ToolsController {

    private final ImageProcessingService imageProcessingService;
    private final AadhaarCombinerService aadhaarCombinerService;

    @PostMapping("/resize")
    @Operation(summary = "Resize an image (width, height, maxSizeKB)")
    public ResponseEntity<byte[]> resize(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "width", required = false) Integer width,
            @RequestParam(value = "height", required = false) Integer height,
            @RequestParam(value = "maxSizeKB", required = false, defaultValue = "50") Integer maxSizeKB) throws IOException {

        byte[] resized = imageProcessingService.resize(file.getBytes(), width, height, maxSizeKB);

        String filename = "resized_" + (width != null ? width : "auto") + "x" + (height != null ? height : "auto") + ".jpg";

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(resized.length)
                .body(resized);
    }

    @PostMapping("/combine-aadhaar")
    @Operation(summary = "Combine Aadhaar front + back into a single file")
    public ResponseEntity<byte[]> combineAadhaar(
            @RequestParam("front") MultipartFile front,
            @RequestParam("back") MultipartFile back,
            @RequestParam(value = "outputType", required = false, defaultValue = "IMAGE") String outputType) throws IOException {

        boolean isPdf = "PDF".equalsIgnoreCase(outputType);
        byte[] result;
        MediaType mediaType;
        String filename;

        if (isPdf) {
            result = aadhaarCombinerService.combineAsPdf(front.getBytes(), back.getBytes());
            mediaType = MediaType.APPLICATION_PDF;
            filename = "aadhaar_combined.pdf";
        } else {
            result = aadhaarCombinerService.combineAsImage(front.getBytes(), back.getBytes());
            mediaType = MediaType.IMAGE_JPEG;
            filename = "aadhaar_combined.jpg";
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(result.length)
                .body(result);
    }
}
