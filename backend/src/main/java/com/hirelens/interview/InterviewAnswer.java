package com.hirelens.interview;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private InterviewSession session;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    private int score; // 1 - 10

    private int correctness; // 1 - 10

    @Column(name = "technical_depth")
    private int technicalDepth; // 1 - 10

    private int communication; // 1 - 10

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "missing_points", columnDefinition = "TEXT")
    private String missingPoints;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = Instant.now();
        }
    }
}
