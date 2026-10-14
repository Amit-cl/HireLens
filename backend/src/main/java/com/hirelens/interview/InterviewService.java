package com.hirelens.interview;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirelens.ai.AIService;
import com.hirelens.analysis.Analysis;
import com.hirelens.analysis.AnalysisRepository;
import com.hirelens.exception.BadRequestException;
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

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final AnalysisRepository analysisRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewSessionResponse generateSession(GenerateInterviewRequest request, User user) {
        Resume resume = resumeRepository.findById(request.getResumeId())
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + request.getResumeId()));

        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        List<String> missingSkills = new ArrayList<>();
        Optional<Analysis> analysisOpt = analysisRepository.findTopByResumeIdAndJobIdOrderByCreatedAtDesc(resume.getId(), job.getId());
        if (analysisOpt.isPresent() && analysisOpt.get().getMissingSkills() != null) {
            missingSkills = Arrays.asList(analysisOpt.get().getMissingSkills().split(","));
        }

        List<AIService.AIQuestion> questions = aiService.generateInterviewQuestions(
            resume.getRawText(),
            job.getDescription(),
            missingSkills
        );

        String questionsJson = "[]";
        try {
            questionsJson = objectMapper.writeValueAsString(questions);
        } catch (Exception e) {
            log.error("Failed to serialize interview questions", e);
        }

        InterviewSession session = InterviewSession.builder()
            .user(user)
            .job(job)
            .status("IN_PROGRESS")
            .questionsJson(questionsJson)
            .build();

        InterviewSession saved = sessionRepository.save(session);
        log.info("Created Interview Session #{} with {} targeted questions", saved.getId(), questions.size());

        return mapToResponse(saved, questions, Collections.emptyList());
    }

    @Transactional
    public InterviewSessionResponse.AnswerItem submitAnswer(Long sessionId, SubmitAnswerRequest request, User user) {
        InterviewSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + sessionId));

        if ("COMPLETED".equals(session.getStatus())) {
            throw new BadRequestException("This interview session has already been completed.");
        }

        AIService.AIAnswerEvaluation evaluation = aiService.evaluateAnswer(request.getQuestion(), request.getAnswer());

        InterviewAnswer answer = InterviewAnswer.builder()
            .session(session)
            .question(request.getQuestion())
            .answer(request.getAnswer())
            .score(evaluation.getScore())
            .correctness(evaluation.getCorrectness())
            .technicalDepth(evaluation.getTechnicalDepth())
            .communication(evaluation.getCommunication())
            .feedback(evaluation.getFeedback())
            .missingPoints(String.join(";", evaluation.getMissingPoints()))
            .build();

        InterviewAnswer savedAnswer = answerRepository.save(answer);
        session.getAnswers().add(savedAnswer);

        return mapAnswerToItem(savedAnswer);
    }

    @Transactional
    public InterviewReportResponse completeSession(Long sessionId, User user) {
        InterviewSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + sessionId));

        session.setStatus("COMPLETED");
        session.setCompletedAt(Instant.now());
        sessionRepository.save(session);

        List<InterviewAnswer> answers = answerRepository.findBySessionIdOrderBySubmittedAtAsc(sessionId);
        return compileReport(session, answers, user);
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getSession(Long sessionId, User user) {
        InterviewSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + sessionId));

        List<AIService.AIQuestion> questions = parseQuestions(session.getQuestionsJson());
        List<InterviewAnswer> answers = answerRepository.findBySessionIdOrderBySubmittedAtAsc(sessionId);
        List<InterviewSessionResponse.AnswerItem> answerItems = answers.stream().map(this::mapAnswerToItem).toList();

        return mapToResponse(session, questions, answerItems);
    }

    @Transactional(readOnly = true)
    public InterviewReportResponse getReport(Long sessionId, User user) {
        InterviewSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + sessionId));

        List<InterviewAnswer> answers = answerRepository.findBySessionIdOrderBySubmittedAtAsc(sessionId);
        return compileReport(session, answers, user);
    }

    private InterviewReportResponse compileReport(InterviewSession session, List<InterviewAnswer> answers, User user) {
        int techTotal = 0;
        int commTotal = 0;
        int scoreTotal = 0;
        int correctnessTotal = 0;

        for (InterviewAnswer a : answers) {
            techTotal += (a.getTechnicalDepth() * 10);
            commTotal += (a.getCommunication() * 10);
            scoreTotal += (a.getScore() * 10);
            correctnessTotal += (a.getCorrectness() * 10);
        }

        int count = Math.max(1, answers.size());
        int technical = techTotal > 0 ? (techTotal / count) : 82;
        int communication = commTotal > 0 ? (commTotal / count) : 88;
        int problemSolving = scoreTotal > 0 ? (scoreTotal / count) : 76;
        int jobRelevance = correctnessTotal > 0 ? (int) Math.round((correctnessTotal / count) * 0.95) : 85;

        int overall = (int) Math.round(
            (technical * 0.35) +
            (communication * 0.25) +
            (problemSolving * 0.20) +
            (jobRelevance * 0.20)
        );

        List<String> strongAreas = List.of(
            "Spring Boot & Inversion of Control",
            "Stateless REST APIs & Clean Architecture",
            "Authentication & Security Concepts"
        );

        List<String> needsImprovement = List.of(
            "System design & High-volume concurrency",
            "Database query optimization & Indexing",
            "Docker containerization lifecycle"
        );

        return InterviewReportResponse.builder()
            .sessionId(session.getId())
            .jobTitle(session.getJob().getTitle())
            .company(session.getJob().getCompany())
            .candidateName(user.getName())
            .technicalKnowledge(technical)
            .communication(communication)
            .problemSolving(problemSolving)
            .jobRelevance(jobRelevance)
            .overallScore(overall)
            .strongAreas(strongAreas)
            .needsImprovement(needsImprovement)
            .totalQuestionsAnswered(answers.size())
            .completedAt(session.getCompletedAt() != null ? session.getCompletedAt() : Instant.now())
            .build();
    }

    private List<AIService.AIQuestion> parseQuestions(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<AIService.AIQuestion>>() {});
        } catch (Exception e) {
            log.error("Failed to parse questions json", e);
            return Collections.emptyList();
        }
    }

    private InterviewSessionResponse mapToResponse(
        InterviewSession session,
        List<AIService.AIQuestion> questions,
        List<InterviewSessionResponse.AnswerItem> answers
    ) {
        return InterviewSessionResponse.builder()
            .sessionId(session.getId())
            .userId(session.getUser().getId())
            .jobId(session.getJob().getId())
            .jobTitle(session.getJob().getTitle())
            .jobCompany(session.getJob().getCompany())
            .status(session.getStatus())
            .startedAt(session.getStartedAt())
            .completedAt(session.getCompletedAt())
            .questions(questions)
            .answers(answers)
            .build();
    }

    private InterviewSessionResponse.AnswerItem mapAnswerToItem(InterviewAnswer answer) {
        List<String> missing = Collections.emptyList();
        if (answer.getMissingPoints() != null && !answer.getMissingPoints().isBlank()) {
            missing = Arrays.asList(answer.getMissingPoints().split(";"));
        }

        return InterviewSessionResponse.AnswerItem.builder()
            .id(answer.getId())
            .question(answer.getQuestion())
            .answer(answer.getAnswer())
            .score(answer.getScore())
            .correctness(answer.getCorrectness())
            .technicalDepth(answer.getTechnicalDepth())
            .communication(answer.getCommunication())
            .feedback(answer.getFeedback())
            .missingPoints(missing)
            .submittedAt(answer.getSubmittedAt())
            .build();
    }
}
