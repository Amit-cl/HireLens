package com.hirelens.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewReportResponse {

    private Long sessionId;
    private String jobTitle;
    private String company;
    private String candidateName;

    private int technicalKnowledge; // %
    private int communication;      // %
    private int problemSolving;     // %
    private int jobRelevance;       // %
    private int overallScore;       // %

    private List<String> strongAreas;
    private List<String> needsImprovement;

    private int totalQuestionsAnswered;
    private Instant completedAt;
}
