package com.hirelens.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalysisResponse {

    private Long id;
    private Long userId;
    private Long resumeId;
    private String resumeFileName;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;

    private int overallScore;
    private int skillScore;
    private int keywordScore;
    private int experienceScore;
    private int educationScore;

    private List<String> skillsMatched;
    private List<String> missingSkills;
    private List<String> recommendations;
    private Instant createdAt;

    public static AnalysisResponse fromEntity(Analysis entity) {
        return AnalysisResponse.builder()
            .id(entity.getId())
            .userId(entity.getUser().getId())
            .resumeId(entity.getResume().getId())
            .resumeFileName(entity.getResume().getFileName())
            .jobId(entity.getJob().getId())
            .jobTitle(entity.getJob().getTitle())
            .jobCompany(entity.getJob().getCompany())
            .overallScore(entity.getOverallScore())
            .skillScore(entity.getSkillScore())
            .keywordScore(entity.getKeywordScore())
            .experienceScore(entity.getExperienceScore())
            .educationScore(entity.getEducationScore())
            .skillsMatched(parseDelimited(entity.getSkillsMatched(), ","))
            .missingSkills(parseDelimited(entity.getMissingSkills(), ","))
            .recommendations(parseDelimited(entity.getRecommendations(), "\n"))
            .createdAt(entity.getCreatedAt())
            .build();
    }

    private static List<String> parseDelimited(String input, String delimiter) {
        if (input == null || input.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(input.split(delimiter))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    }
}
