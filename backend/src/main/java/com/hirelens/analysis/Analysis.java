package com.hirelens.analysis;

import com.hirelens.job.Job;
import com.hirelens.resume.Resume;
import com.hirelens.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "skill_score", nullable = false)
    private int skillScore;

    @Column(name = "keyword_score", nullable = false)
    private int keywordScore;

    @Column(name = "experience_score", nullable = false)
    private int experienceScore;

    @Column(name = "education_score", nullable = false)
    private int educationScore;

    @Column(name = "skills_matched", columnDefinition = "TEXT")
    private String skillsMatched;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
