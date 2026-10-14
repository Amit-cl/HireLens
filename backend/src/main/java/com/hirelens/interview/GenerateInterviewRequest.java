package com.hirelens.interview;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GenerateInterviewRequest {

    @NotNull(message = "resumeId is required")
    private Long resumeId;

    @NotNull(message = "jobId is required")
    private Long jobId;
}
