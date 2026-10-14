package com.hirelens.interview;

import com.hirelens.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/generate")
    public ResponseEntity<InterviewSessionResponse> generateInterview(
        @Valid @RequestBody GenerateInterviewRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        InterviewSessionResponse response = interviewService.generateSession(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<InterviewSessionResponse.AnswerItem> submitAnswer(
        @PathVariable Long sessionId,
        @Valid @RequestBody SubmitAnswerRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        InterviewSessionResponse.AnswerItem answer = interviewService.submitAnswer(sessionId, request, currentUser);
        return ResponseEntity.ok(answer);
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<InterviewReportResponse> completeInterview(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal User currentUser
    ) {
        InterviewReportResponse report = interviewService.completeSession(sessionId, currentUser);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> getSession(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal User currentUser
    ) {
        InterviewSessionResponse response = interviewService.getSession(sessionId, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{sessionId}/report")
    public ResponseEntity<InterviewReportResponse> getReport(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal User currentUser
    ) {
        InterviewReportResponse report = interviewService.getReport(sessionId, currentUser);
        return ResponseEntity.ok(report);
    }
}
