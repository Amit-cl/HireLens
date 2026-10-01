package com.hirelens.resume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);

    Optional<Resume> findByIdAndUserId(Long id, Long userId);
}
