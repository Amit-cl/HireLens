package com.hirelens.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {

    List<InterviewAnswer> findBySessionIdOrderBySubmittedAtAsc(Long sessionId);
}
