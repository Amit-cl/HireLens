package com.hirelens.ai;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromptService {

    public String buildResumeAnalysisPrompt(String resumeText, String jobDescription) {
        return """
            You are an expert Technical Recruiter and ATS Evaluation Engine.
            Analyze the following resume against the job description.
            
            JOB DESCRIPTION:
            %s
            
            RESUME:
            %s
            
            Apply the following deterministic scoring rubric:
            - Skill Match (Weight: 40%%)
            - Keyword Match (Weight: 25%%)
            - Experience Match (Weight: 20%%)
            - Education Match (Weight: 15%%)
            Final Score = (skillScore * 0.40) + (keywordScore * 0.25) + (experienceScore * 0.20) + (educationScore * 0.15)
            
            Return ONLY a valid JSON object matching this schema:
            {
              "overallScore": 78,
              "skillScore": 80,
              "keywordScore": 75,
              "experienceScore": 82,
              "educationScore": 70,
              "skillsMatched": ["Java", "Spring Boot", "PostgreSQL", "REST API"],
              "missingSkills": ["Docker", "Kafka"],
              "recommendations": [
                "Add Docker project experience",
                "Mention REST API development projects"
              ]
            }
            """.formatted(jobDescription, resumeText);
    }

    public String buildInterviewGenerationPrompt(String resumeText, String jobDescription, List<String> missingSkills) {
        return """
            You are an experienced Senior Technical Hiring Manager conducting a technical interview.
            Based on the candidate's resume, job description, and identified skill gaps: %s
            
            Generate 5 targeted technical and behavioral interview questions.
            Ensure questions specifically test the candidate's depth and missing skill areas.
            
            JOB DESCRIPTION:
            %s
            
            RESUME:
            %s
            
            Return ONLY a valid JSON object matching this schema:
            {
              "questions": [
                {
                  "question": "Explain dependency injection in Spring Boot and how it differs from traditional object creation.",
                  "type": "technical",
                  "difficulty": "medium",
                  "targetedSkill": "Spring Boot"
                }
              ]
            }
            """.formatted(missingSkills, jobDescription, resumeText);
    }

    public String buildAnswerEvaluationPrompt(String question, String candidateAnswer) {
        return """
            You are an expert technical interviewer evaluating a candidate's answer.
            
            QUESTION:
            %s
            
            CANDIDATE ANSWER:
            %s
            
            Evaluate the answer on:
            1. Correctness (1-10)
            2. Technical Depth (1-10)
            3. Communication (1-10)
            Overall Answer Score (1-10)
            
            Return ONLY a valid JSON object matching this schema:
            {
              "score": 8,
              "correctness": 9,
              "technicalDepth": 7,
              "communication": 8,
              "feedback": "Concise and accurate explanation.",
              "missingPoints": ["Could mention specific real-world examples."]
            }
            """.formatted(question, candidateAnswer);
    }
}
