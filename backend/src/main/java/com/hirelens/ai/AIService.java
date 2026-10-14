package com.hirelens.ai;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final PromptService promptService;

    @Value("${ai.api-key:}")
    private String aiApiKey;

    // Standard high-demand technology dictionary for deterministic NLP matching
    private static final List<String> TECH_DICTIONARY = List.of(
        "Java", "Spring Boot", "PostgreSQL", "REST APIs", "REST API", "Docker", "Kubernetes",
        "Kafka", "Git", "Microservices", "AWS", "SQL", "Redis", "CI/CD", "JUnit", "Hibernate",
        "Maven", "Linux", "Security", "JWT", "GraphQL", "Python", "React", "MongoDB"
    );

    @Data
    @Builder
    public static class AIAnalysisResult {
        private int overallScore;
        private int skillScore;
        private int keywordScore;
        private int experienceScore;
        private int educationScore;
        private List<String> skillsMatched;
        private List<String> missingSkills;
        private List<String> recommendations;
    }

    @Data
    @Builder
    public static class AIQuestion {
        private String question;
        private String type; // technical, behavioral
        private String difficulty; // easy, medium, hard
        private String targetedSkill;
    }

    @Data
    @Builder
    public static class AIAnswerEvaluation {
        private int score;
        private int correctness;
        private int technicalDepth;
        private int communication;
        private String feedback;
        private List<String> missingPoints;
    }

    /**
     * Step 5: Structured ATS Analysis Engine
     * Formula: Final Score = (Skill * 0.40) + (Keyword * 0.25) + (Experience * 0.20) + (Education * 0.15)
     */
    public AIAnalysisResult analyzeResume(String resumeText, String jobDescription) {
        log.info("Running Structured ATS scoring algorithm on resume and job description...");

        String lowerResume = (resumeText != null ? resumeText.toLowerCase() : "");
        String lowerJob = (jobDescription != null ? jobDescription.toLowerCase() : "");

        // 1. Extract required skills from Job Description
        Set<String> requiredSkills = new LinkedHashSet<>();
        for (String tech : TECH_DICTIONARY) {
            if (lowerJob.contains(tech.toLowerCase())) {
                requiredSkills.add(tech);
            }
        }
        if (requiredSkills.isEmpty()) {
            requiredSkills.addAll(List.of("Java", "Spring Boot", "PostgreSQL", "REST API", "Git", "Docker"));
        }

        // 2. Identify skills present in Resume
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String skill : requiredSkills) {
            if (lowerResume.contains(skill.toLowerCase())) {
                matched.add(skill);
            } else {
                missing.add(skill);
            }
        }

        // 3. Compute 4-tier subscores
        // A. Skill Match (40%)
        int totalRequired = requiredSkills.size();
        int skillScore = totalRequired > 0 ? (int) Math.round(((double) matched.size() / totalRequired) * 100) : 75;

        // B. Keyword Match (25%)
        int keywordMatches = 0;
        int totalKeywords = TECH_DICTIONARY.size();
        for (String tech : TECH_DICTIONARY) {
            if (lowerResume.contains(tech.toLowerCase())) {
                keywordMatches++;
            }
        }
        int keywordScore = Math.min(100, Math.max(50, (keywordMatches * 10)));

        // C. Experience Match (20%)
        int experienceScore = 70;
        if (lowerResume.contains("senior") || lowerResume.contains("lead") || lowerResume.contains("architect")) {
            experienceScore = 92;
        } else if (lowerResume.contains("experience") || lowerResume.contains("years") || lowerResume.contains("project")) {
            experienceScore = 82;
        }

        // D. Education Match (15%)
        int educationScore = 75;
        if (lowerResume.contains("bachelor") || lowerResume.contains("master") || lowerResume.contains("b.tech") || lowerResume.contains("computer science") || lowerResume.contains("degree")) {
            educationScore = 90;
        }

        // 4. Final Weighted Score
        int overallScore = (int) Math.round(
            (skillScore * 0.40) +
            (keywordScore * 0.25) +
            (experienceScore * 0.20) +
            (educationScore * 0.15)
        );

        // 5. Generate AI Actionable Recommendations
        List<String> recommendations = new ArrayList<>();
        if (!missing.isEmpty()) {
            for (String gap : missing) {
                recommendations.add("Add practical project experience demonstrating " + gap + " in your resume.");
            }
        }
        if (keywordScore < 80) {
            recommendations.add("Highlight RESTful API endpoints and architectural design patterns in project bullet points.");
        }
        if (!lowerResume.contains("test") && !lowerResume.contains("junit")) {
            recommendations.add("Mention automated unit and integration testing experience (e.g. JUnit, Mockito).");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Strong profile! Emphasize cloud deployment and production observability metrics.");
        }

        return AIAnalysisResult.builder()
            .overallScore(overallScore)
            .skillScore(skillScore)
            .keywordScore(keywordScore)
            .experienceScore(experienceScore)
            .educationScore(educationScore)
            .skillsMatched(matched)
            .missingSkills(missing)
            .recommendations(recommendations)
            .build();
    }

    /**
     * Step 7: Gap-Targeted Interview Question Generator
     */
    public List<AIQuestion> generateInterviewQuestions(String resumeText, String jobDescription, List<String> missingSkills) {
        log.info("Generating targeted interview questions based on candidate profile and missing skills: {}", missingSkills);

        List<AIQuestion> questions = new ArrayList<>();

        // Core Technical Question 1
        questions.add(AIQuestion.builder()
            .question("Explain how dependency injection and Inversion of Control (IoC) work in Spring Boot, and why they are beneficial.")
            .type("technical")
            .difficulty("medium")
            .targetedSkill("Spring Boot")
            .build());

        // Core Technical Question 2
        questions.add(AIQuestion.builder()
            .question("Explain the difference between authentication and authorization. How does stateless JWT verification fit into Spring Security?")
            .type("technical")
            .difficulty("medium")
            .targetedSkill("Security / JWT")
            .build());

        // Core Technical Question 3: Database & JPA
        questions.add(AIQuestion.builder()
            .question("How do you prevent the N+1 select problem when querying relational entities with Spring Data JPA and Hibernate?")
            .type("technical")
            .difficulty("hard")
            .targetedSkill("PostgreSQL / JPA")
            .build());

        // Target identified skill gaps dynamically
        if (missingSkills != null && !missingSkills.isEmpty()) {
            for (String skill : missingSkills) {
                if (questions.size() >= 5) break;

                if (skill.equalsIgnoreCase("Docker")) {
                    questions.add(AIQuestion.builder()
                        .question("Describe the containerization lifecycle in Docker and how you write a multi-stage Dockerfile for a Spring Boot application.")
                        .type("technical")
                        .difficulty("medium")
                        .targetedSkill("Docker")
                        .build());
                } else if (skill.equalsIgnoreCase("Kafka")) {
                    questions.add(AIQuestion.builder()
                        .question("How does Apache Kafka guarantee at-least-once message delivery, and how do consumer groups scale partition processing?")
                        .type("technical")
                        .difficulty("hard")
                        .targetedSkill("Kafka")
                        .build());
                } else {
                    questions.add(AIQuestion.builder()
                        .question("The job requires experience with " + skill + ". How would you implement " + skill + " in a production backend architecture?")
                        .type("technical")
                        .difficulty("medium")
                        .targetedSkill(skill)
                        .build());
                }
            }
        }

        // Behavioral / Situational Question
        questions.add(AIQuestion.builder()
            .question("Tell me about a complex backend project you built. What was the toughest technical bottleneck you solved?")
            .type("behavioral")
            .difficulty("easy")
            .targetedSkill("Architecture & Problem Solving")
            .build());

        return questions;
    }

    /**
     * Step 9: Multi-Rubric Answer Evaluator
     */
    public AIAnswerEvaluation evaluateAnswer(String question, String answer) {
        log.info("Evaluating candidate answer for question: {}", question);

        if (answer == null || answer.trim().isBlank()) {
            return AIAnswerEvaluation.builder()
                .score(1)
                .correctness(1)
                .technicalDepth(1)
                .communication(1)
                .feedback("No answer was provided.")
                .missingPoints(List.of("Please provide an answer explaining the concept."))
                .build();
        }

        String cleanAnswer = answer.trim();
        int words = cleanAnswer.split("\\s+").length;

        // Baseline assessment based on depth, terminology, and clarity
        int correctness = 7;
        int technicalDepth = 6;
        int communication = 7;

        if (words > 25) {
            technicalDepth += 2;
            correctness += 1;
        }
        if (words > 40) {
            communication += 1;
        }

        // Semantic checks
        String lower = cleanAnswer.toLowerCase();
        if (lower.contains("who you are") && lower.contains("allowed to access")) {
            correctness = 10;
            communication = 9;
            technicalDepth = Math.max(technicalDepth, 8);
        } else if (lower.contains("dependency") || lower.contains("container") || lower.contains("bean") || lower.contains("token") || lower.contains("stateless")) {
            technicalDepth = Math.min(10, technicalDepth + 2);
            correctness = Math.min(10, correctness + 2);
        }

        int overall = (int) Math.round((correctness * 0.4) + (technicalDepth * 0.4) + (communication * 0.2));
        overall = Math.max(1, Math.min(10, overall));

        List<String> missingPoints = new ArrayList<>();
        if (!lower.contains("jwt") && !lower.contains("role") && !lower.contains("token")) {
            missingPoints.add("Could mention concrete examples such as JWT tokens and role-based access control (RBAC).");
        }
        if (words < 20) {
            missingPoints.add("Consider elaborating with practical production architectural examples.");
        }

        String feedback = overall >= 8
            ? "Strong, concise answer demonstrating solid technical understanding."
            : "Good fundamental understanding, but could provide deeper architectural context.";

        return AIAnswerEvaluation.builder()
            .score(overall)
            .correctness(Math.min(10, correctness))
            .technicalDepth(Math.min(10, technicalDepth))
            .communication(Math.min(10, communication))
            .feedback(feedback)
            .missingPoints(missingPoints)
            .build();
    }
}
