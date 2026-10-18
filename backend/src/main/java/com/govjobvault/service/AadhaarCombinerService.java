package com.govjobvault.service;

import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class AadhaarCombinerService {

    private static final int GAP_PX = 20; // White gap between front and back
    private static final int TARGET_WIDTH = 800; // Normalized width for combining

    /**
     * Combine front + back as a single stacked image (front on top, back below, white gap).
     */
    public byte[] combineAsImage(byte[] frontBytes, byte[] backBytes) throws IOException {
        BufferedImage front = readAndNormalize(frontBytes);
        BufferedImage back = readAndNormalize(backBytes);

        int totalHeight = front.getHeight() + GAP_PX + back.getHeight();

        BufferedImage combined = new BufferedImage(TARGET_WIDTH, totalHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = combined.createGraphics();

        // White background
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, TARGET_WIDTH, totalHeight);

        // Draw front on top
        g.drawImage(front, 0, 0, null);

        // Draw back below with gap
        g.drawImage(back, 0, front.getHeight() + GAP_PX, null);

        g.dispose();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(combined, "jpg", out);

        log.info("Combined Aadhaar as image: {}x{}", TARGET_WIDTH, totalHeight);
        return out.toByteArray();
    }

    /**
     * Combine front + back as a single-page PDF.
     */
    public byte[] combineAsPdf(byte[] frontBytes, byte[] backBytes) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document doc = new Document(PageSize.A4, 20, 20, 20, 20);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            float pageWidth = PageSize.A4.getWidth() - 40; // margins

            Image frontImg = Image.getInstance(frontBytes);
            frontImg.scaleToFit(pageWidth, PageSize.A4.getHeight() / 2 - 30);
            frontImg.setAlignment(Image.ALIGN_CENTER);
            doc.add(frontImg);

            // Add spacing
            doc.add(new com.lowagie.text.Paragraph("\n"));

            Image backImg = Image.getInstance(backBytes);
            backImg.scaleToFit(pageWidth, PageSize.A4.getHeight() / 2 - 30);
            backImg.setAlignment(Image.ALIGN_CENTER);
            doc.add(backImg);

        } finally {
            doc.close();
        }

        log.info("Combined Aadhaar as PDF: {} KB", out.size() / 1024);
        return out.toByteArray();
    }

    /**
     * Normalize an image to TARGET_WIDTH while preserving aspect ratio.
     */
    private BufferedImage readAndNormalize(byte[] bytes) throws IOException {
        BufferedImage img = ImageIO.read(new ByteArrayInputStream(bytes));
        if (img == null) throw new RuntimeException("Could not read image");

        if (img.getWidth() == TARGET_WIDTH) return img;

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(bytes))
                .width(TARGET_WIDTH)
                .keepAspectRatio(true)
                .outputFormat("jpg")
                .toOutputStream(out);
        return ImageIO.read(new ByteArrayInputStream(out.toByteArray()));
    }
}
