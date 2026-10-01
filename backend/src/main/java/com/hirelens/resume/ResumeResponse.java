package com.hirelens.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumeResponse {

    private Long id;
    private Long userId;
    private String fileName;
    private String rawText;
    private String rawTextPreview;
    private int characterCount;
    private int wordCount;
    private Instant uploadedAt;

    public static ResumeResponse fromEntity(Resume resume) {
        String text = resume.getRawText();
        String preview = text != null && text.length() > 300 
            ? text.substring(0, 300) + "..." 
            : text;

        int words = 0;
        if (text != null && !text.isBlank()) {
            words = text.trim().split("\\s+").length;
        }

        return ResumeResponse.builder()
            .id(resume.getId())
            .userId(resume.getUser().getId())
            .fileName(resume.getFileName())
            .rawText(text)
            .rawTextPreview(preview)
            .characterCount(text != null ? text.length() : 0)
            .wordCount(words)
            .uploadedAt(resume.getUploadedAt())
            .build();
    }
}
