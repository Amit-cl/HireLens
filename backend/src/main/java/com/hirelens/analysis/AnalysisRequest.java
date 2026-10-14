package com.hirelens.analysis;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalysisRequest {

    @NotNull(message = "resumeId is required")
    private Long resumeId;

    @NotNull(message = "jobId is required")
    private Long jobId;
}
