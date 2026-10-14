package com.hirelens.interview;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmitAnswerRequest {

    @NotBlank(message = "Question text is required")
    private String question;

    @NotBlank(message = "Answer text is required")
    private String answer;
}
