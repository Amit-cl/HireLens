package com.hirelens.job;

import com.hirelens.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    @Transactional
    public JobResponse createJob(CreateJobRequest request) {
        Job job = Job.builder()
            .title(request.getTitle().trim())
            .company(request.getCompany().trim())
            .description(request.getDescription().trim())
            .build();

        Job savedJob = jobRepository.save(job);
        return JobResponse.fromEntity(savedJob);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(JobResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        return JobResponse.fromEntity(job);
    }
}
