package com.hirelens.resume;

import com.hirelens.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal User currentUser
    ) {
        ResumeResponse response = resumeService.uploadResume(file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
        @AuthenticationPrincipal User currentUser
    ) {
        List<ResumeResponse> resumes = resumeService.getUserResumes(currentUser);
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResumeById(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        ResumeResponse resume = resumeService.getResumeById(id, currentUser);
        return ResponseEntity.ok(resume);
    }
}
