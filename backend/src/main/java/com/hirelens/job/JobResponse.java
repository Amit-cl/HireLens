package com.hirelens.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobResponse {

    private Long id;
    private String title;
    private String company;
    private String description;
    private Instant createdAt;

    public static JobResponse fromEntity(Job job) {
        return JobResponse.builder()
            .id(job.getId())
            .title(job.getTitle())
            .company(job.getCompany())
            .description(job.getDescription())
            .createdAt(job.getCreatedAt())
            .build();
    }
}
