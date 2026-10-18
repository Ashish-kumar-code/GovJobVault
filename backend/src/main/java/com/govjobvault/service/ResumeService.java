package com.govjobvault.service;

import com.govjobvault.entity.Profile;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class ResumeService {

    // ── Colors ──
    private static final Color BLUE_ACCENT = new Color(29, 78, 216);   // #1d4ed8
    private static final Color DARK_TEXT   = new Color(15, 23, 42);     // #0f172a
    private static final Color GRAY_TEXT   = new Color(71, 85, 105);    // #475569
    private static final Color LIGHT_LINE  = new Color(203, 213, 225);  // #cbd5e1

    // ── Fonts ──
    private static final Font FONT_NAME      = new Font(Font.HELVETICA, 22, Font.BOLD, DARK_TEXT);
    private static final Font FONT_CONTACT   = new Font(Font.HELVETICA, 9, Font.NORMAL, GRAY_TEXT);
    private static final Font FONT_HEADING   = new Font(Font.HELVETICA, 12, Font.BOLD, BLUE_ACCENT);
    private static final Font FONT_LABEL     = new Font(Font.HELVETICA, 9, Font.BOLD, GRAY_TEXT);
    private static final Font FONT_VALUE     = new Font(Font.HELVETICA, 10, Font.NORMAL, DARK_TEXT);
    private static final Font FONT_BODY      = new Font(Font.HELVETICA, 10, Font.NORMAL, DARK_TEXT);
    private static final Font FONT_SMALL     = new Font(Font.HELVETICA, 8, Font.ITALIC, GRAY_TEXT);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * Generate a professional A4 PDF resume from the given Profile.
     */
    public byte[] generateResume(Profile profile) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document doc = new Document(PageSize.A4, 40, 40, 36, 36);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ═══ HEADER: Name + Blue Underline ═══
            addHeader(doc, profile);

            // ═══ CONTACT INFO ROW ═══
            addContactRow(doc, profile);

            doc.add(spacer(12));

            // ═══ PERSONAL DETAILS ═══
            if (hasPersonalDetails(profile)) {
                addSectionHeading(doc, "PERSONAL DETAILS");
                PdfPTable table = detailTable();
                addRow(table, "Father's Name", profile.getFatherName());
                addRow(table, "Mother's Name", profile.getMotherName());
                addRow(table, "Date of Birth", profile.getDateOfBirth() != null ? profile.getDateOfBirth().format(DATE_FMT) : null);
                addRow(table, "Gender", profile.getGender() != null ? profile.getGender().name() : null);
                addRow(table, "Category", profile.getCategory());
                addRow(table, "Aadhaar No.", profile.getAadhaarNumber());
                doc.add(table);
                doc.add(spacer(8));
            }

            // ═══ ADDRESS ═══
            if (hasAny(profile.getAddress(), profile.getState(), profile.getPincode())) {
                addSectionHeading(doc, "ADDRESS");
                StringBuilder addr = new StringBuilder();
                if (profile.getAddress() != null) addr.append(profile.getAddress());
                if (profile.getState() != null) {
                    if (addr.length() > 0) addr.append(", ");
                    addr.append(profile.getState());
                }
                if (profile.getPincode() != null) {
                    if (addr.length() > 0) addr.append(" - ");
                    addr.append(profile.getPincode());
                }
                doc.add(wrappingParagraph(addr.toString()));
                doc.add(spacer(8));
            }

            // ═══ EDUCATION ═══
            if (hasAny(profile.getBoard(), profile.getMarks(), profile.getPassingYear())) {
                addSectionHeading(doc, "EDUCATION");
                PdfPTable table = detailTable();
                addRow(table, "Board / University", profile.getBoard());
                addRow(table, "Marks / Percentage", profile.getMarks());
                addRow(table, "Roll Number", profile.getRollNumber());
                addRow(table, "Roll Code", profile.getRollCode());
                addRow(table, "Passing Year", profile.getPassingYear());
                doc.add(table);
                doc.add(spacer(8));
            }

            // ═══ SKILLS ═══
            if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
                addSectionHeading(doc, "SKILLS");
                doc.add(wrappingParagraph(profile.getSkills()));
                doc.add(spacer(8));
            }

            // ═══ CERTIFICATES ═══
            if (profile.getCertificates() != null && !profile.getCertificates().isBlank()) {
                addSectionHeading(doc, "CERTIFICATES & COURSES");
                doc.add(wrappingParagraph(profile.getCertificates()));
                doc.add(spacer(8));
            }

            // ═══ LINKEDIN ═══
            if (profile.getLinkedinUrl() != null && !profile.getLinkedinUrl().isBlank()) {
                addSectionHeading(doc, "ONLINE PRESENCE");
                Paragraph p = new Paragraph("LinkedIn: " + profile.getLinkedinUrl(), FONT_BODY);
                p.setSpacingAfter(8);
                doc.add(p);
            }

            // ═══ DECLARATION ═══
            doc.add(spacer(16));
            addSectionHeading(doc, "DECLARATION");
            Paragraph decl = new Paragraph(
                    "I hereby declare that the above information is true to the best of my knowledge and belief.",
                    FONT_BODY);
            decl.setSpacingAfter(24);
            doc.add(decl);

            // Signature line
            Paragraph sigLine = new Paragraph("Date: _______________                                              Signature: _______________", FONT_BODY);
            doc.add(sigLine);

        } catch (Exception e) {
            log.error("Failed to generate resume PDF", e);
            throw new RuntimeException("Resume generation failed: " + e.getMessage());
        } finally {
            doc.close();
        }

        log.info("Generated resume for profile '{}': {} KB", profile.getProfileName(), out.size() / 1024);
        return out.toByteArray();
    }

    // ────────────────────────────────────────
    // Helper methods
    // ────────────────────────────────────────

    private void addHeader(Document doc, Profile profile) throws DocumentException {
        String name = profile.getFullName() != null ? profile.getFullName() : profile.getProfileName();
        Paragraph namePara = new Paragraph(name, FONT_NAME);
        namePara.setAlignment(Element.ALIGN_CENTER);
        namePara.setSpacingAfter(4);
        doc.add(namePara);

        // Blue underline
        LineSeparator line = new LineSeparator(1.5f, 40, BLUE_ACCENT, Element.ALIGN_CENTER, -2);
        doc.add(line);
        doc.add(spacer(6));
    }

    private void addContactRow(Document doc, Profile profile) throws DocumentException {
        StringBuilder contact = new StringBuilder();
        if (profile.getPhone() != null) contact.append("📱 ").append(profile.getPhone());
        if (profile.getEmail() != null) {
            if (contact.length() > 0) contact.append("   |   ");
            contact.append("✉ ").append(profile.getEmail());
        }
        if (profile.getState() != null) {
            if (contact.length() > 0) contact.append("   |   ");
            contact.append("📍 ").append(profile.getState());
            if (profile.getPincode() != null) contact.append(" - ").append(profile.getPincode());
        }

        if (contact.length() > 0) {
            Paragraph p = new Paragraph(contact.toString(), FONT_CONTACT);
            p.setAlignment(Element.ALIGN_CENTER);
            p.setSpacingAfter(4);
            doc.add(p);
        }
    }

    private void addSectionHeading(Document doc, String title) throws DocumentException {
        Paragraph heading = new Paragraph(title, FONT_HEADING);
        heading.setSpacingBefore(4);
        heading.setSpacingAfter(2);
        doc.add(heading);

        LineSeparator line = new LineSeparator(0.8f, 100, LIGHT_LINE, Element.ALIGN_LEFT, -2);
        doc.add(line);
        doc.add(spacer(4));
    }

    private PdfPTable detailTable() {
        PdfPTable table = new PdfPTable(new float[]{35, 65});
        table.setWidthPercentage(100);
        table.setSpacingBefore(2);
        return table;
    }

    private void addRow(PdfPTable table, String label, String value) {
        if (value == null || value.isBlank()) return;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, FONT_LABEL));
        labelCell.setBorder(0);
        labelCell.setPadding(4);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, FONT_VALUE));
        valueCell.setBorder(0);
        valueCell.setPadding(4);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private Paragraph wrappingParagraph(String text) {
        Paragraph p = new Paragraph(text, FONT_BODY);
        p.setLeading(14f);
        return p;
    }

    private Paragraph spacer(float height) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(height);
        return p;
    }

    private boolean hasPersonalDetails(Profile p) {
        return hasAny(
                p.getFatherName(), p.getMotherName(), p.getCategory(),
                p.getAadhaarNumber(),
                p.getGender() != null ? p.getGender().name() : null,
                p.getDateOfBirth() != null ? "yes" : null
        );
    }

    private boolean hasAny(String... values) {
        for (String v : values) { if (v != null && !v.isBlank()) return true; }
        return false;
    }
}
