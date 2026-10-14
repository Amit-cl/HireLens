package com.hirelens.analysis;

import com.hirelens.ai.AIService;
import com.hirelens.exception.ResourceNotFoundException;
import com.hirelens.job.Job;
import com.hirelens.job.JobRepository;
import com.hirelens.resume.Resume;
import com.hirelens.resume.ResumeRepository;
import com.hirelens.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final AIService aiService;

    @Transactional
    public AnalysisResponse generateAnalysis(AnalysisRequest request, User user) {
        Resume resume = resumeRepository.findById(request.getResumeId())
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + request.getResumeId()));

        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        log.info("Generating ATS Resume Analysis for Resume #{} and Job #{}...", resume.getId(), job.getId());

        AIService.AIAnalysisResult aiResult = aiService.analyzeResume(resume.getRawText(), job.getDescription());

        Analysis analysis = Analysis.builder()
            .user(user)
            .resume(resume)
            .job(job)
            .overallScore(aiResult.getOverallScore())
            .skillScore(aiResult.getSkillScore())
            .keywordScore(aiResult.getKeywordScore())
            .experienceScore(aiResult.getExperienceScore())
            .educationScore(aiResult.getEducationScore())
            .skillsMatched(String.join(",", aiResult.getSkillsMatched()))
            .missingSkills(String.join(",", aiResult.getMissingSkills()))
            .recommendations(String.join("\n", aiResult.getRecommendations()))
            .build();

        Analysis saved = analysisRepository.save(analysis);
        log.info("Saved Analysis #{} with Overall ATS Score: {}/100", saved.getId(), saved.getOverallScore());

        return AnalysisResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getLatestAnalysis(Long resumeId, Long jobId) {
        return analysisRepository.findTopByResumeIdAndJobIdOrderByCreatedAtDesc(resumeId, jobId)
            .map(AnalysisResponse::fromEntity)
            .orElseThrow(() -> new ResourceNotFoundException("No analysis found for resume " + resumeId + " and job " + jobId));
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysisById(Long id, User user) {
        Analysis analysis = analysisRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Analysis not found with id: " + id));

        return AnalysisResponse.fromEntity(analysis);
    }

    @Transactional(readOnly = true)
    public List<AnalysisResponse> getUserAnalyses(User user) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(AnalysisResponse::fromEntity)
            .toList();
    }
}
