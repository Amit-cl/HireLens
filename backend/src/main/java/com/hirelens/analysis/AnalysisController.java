package com.hirelens.analysis;

import com.hirelens.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/generate")
    public ResponseEntity<AnalysisResponse> generateAnalysis(
        @Valid @RequestBody AnalysisRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        AnalysisResponse response = analysisService.generateAnalysis(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<AnalysisResponse> getLatestAnalysis(
        @RequestParam Long resumeId,
        @RequestParam Long jobId
    ) {
        AnalysisResponse response = analysisService.getLatestAnalysis(resumeId, jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysisById(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        AnalysisResponse response = analysisService.getAnalysisById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AnalysisResponse>> getMyAnalyses(
        @AuthenticationPrincipal User currentUser
    ) {
        List<AnalysisResponse> list = analysisService.getUserAnalyses(currentUser);
        return ResponseEntity.ok(list);
    }
}
