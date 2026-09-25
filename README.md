# HireLens 🔍

**HireLens** is an AI-powered Technical Resume Matcher & Interview Preparation Platform built with Spring Boot, PostgreSQL, and React.

---

## 🚀 Key Features

- **Automated Resume Ingestion**: High-fidelity PDF parsing powered by Apache PDFBox.
- **Weighted ATS Scoring Engine**:
  $$\text{Final ATS Score} = (\text{Skill Match} \times 0.40) + (\text{Keyword Match} \times 0.25) + (\text{Experience Match} \times 0.20) + (\text{Education Match} \times 0.15)$$
- **Gap-Targeted Interview Generation**: Dynamically creates technical and behavioral questions tailored to candidate missing skills and job prerequisites.
- **Multi-Rubric Answer Evaluation**: Evaluates answers on Technical Depth, Communication, and Correctness with actionable feedback.
- **Enterprise Security**: Stateless JWT-based authentication with role-based access control (USER, ADMIN).

---

## 🛠 Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Apache PDFBox, JJWT, Lombok
- **Database**: PostgreSQL
- **Frontend**: React, Vite, Modern CSS
- **AI Engine**: Structured JSON prompt engineering & deterministic scoring

---

## 📁 Repository Structure

```
hirelens/
├── backend/
│   ├── src/main/java/com/hirelens/
│   │   ├── config/
│   │   ├── security/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── resume/
│   │   ├── job/
│   │   ├── analysis/
│   │   ├── interview/
│   │   ├── ai/
│   │   └── exception/
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
└── frontend/
```

---

## 🚦 Roadmap

- [x] Master Architectural Blueprint & Implementation Plan
- [ ] Phase 1: Spring Boot foundation & PostgreSQL setup
- [ ] Phase 2: User Authentication & JWT Security
- [ ] Phase 3: Resume PDF Upload & Text Parsing
- [ ] Phase 4: Job Description Management
- [ ] Phase 5: Structured AI Resume Analysis Engine
- [ ] Phase 6: React Analytics Dashboard
- [ ] Phase 7: AI Dynamic Interview Generator
- [ ] Phase 8: Mock Interview Room & Answer Capture
- [ ] Phase 9: Multi-Rubric Answer Evaluation & Final Report
- [ ] Phase 10: Dockerization, OpenAPI/Swagger & Production Packaging
