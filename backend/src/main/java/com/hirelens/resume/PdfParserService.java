package com.hirelens.resume;

import com.hirelens.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class PdfParserService {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty. Please upload a valid PDF resume.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Invalid file format. Only PDF files (.pdf) are supported.");
        }

        try (InputStream inputStream = file.getInputStream();
             RandomAccessReadBuffer buffer = new RandomAccessReadBuffer(inputStream);
             PDDocument document = Loader.loadPDF(buffer)) {

            if (document.isEncrypted()) {
                throw new BadRequestException("Uploaded PDF is password-protected. Please upload an unprotected PDF.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException(
                    "No extractable text was found in the PDF. The document might contain only scanned images without an OCR text layer."
                );
            }

            log.info("Successfully extracted {} characters of text from resume: {}", text.length(), originalFilename);
            return text.trim();

        } catch (IOException e) {
            log.error("Failed to parse PDF file: {}", originalFilename, e);
            throw new BadRequestException("Failed to read or parse PDF file: " + e.getMessage());
        }
    }
}
