package com.hirelens.interview;

import com.hirelens.ai.AIService;
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
public class InterviewSessionResponse {

    private Long sessionId;
    private Long userId;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;
    private String status;
    private Instant startedAt;
    private Instant completedAt;

    private List<AIService.AIQuestion> questions;
    private List<AnswerItem> answers;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnswerItem {
        private Long id;
        private String question;
        private String answer;
        private int score;
        private int correctness;
        private int technicalDepth;
        private int communication;
        private String feedback;
        private List<String> missingPoints;
        private Instant submittedAt;
    }
}
