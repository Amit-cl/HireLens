package com.hirelens.analysis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {

    List<Analysis> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Analysis> findTopByResumeIdAndJobIdOrderByCreatedAtDesc(Long resumeId, Long jobId);

    Optional<Analysis> findByIdAndUserId(Long id, Long userId);
}
