package com.hirelens.resume;

import com.hirelens.exception.ResourceNotFoundException;
import com.hirelens.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final PdfParserService pdfParserService;

    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, User user) {
        String extractedText = pdfParserService.extractText(file);

        Resume resume = Resume.builder()
            .user(user)
            .fileName(file.getOriginalFilename())
            .rawText(extractedText)
            .build();

        Resume savedResume = resumeRepository.save(resume);
        return ResumeResponse.fromEntity(savedResume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getUserResumes(User user) {
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId())
            .stream()
            .map(ResumeResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(Long id, User user) {
        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        return ResumeResponse.fromEntity(resume);
    }
}
