package com.hirelens.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobDataInitializer implements CommandLineRunner {

    private final JobRepository jobRepository;

    @Override
    public void run(String... args) {
        if (jobRepository.count() == 0) {
            Job defaultJob = Job.builder()
                .title("Java Backend Developer")
                .company("HireLens Technologies")
                .description("Looking for Java developer with Spring Boot, PostgreSQL, REST APIs, Git and Docker experience.")
                .build();

            jobRepository.save(defaultJob);
            log.info("Initialized default job description: {} at {}", defaultJob.getTitle(), defaultJob.getCompany());
        }
    }
}
