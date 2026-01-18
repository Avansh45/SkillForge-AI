package com.skillforge.service;

import com.skillforge.dto.AiGeneratedQuestion;
import com.skillforge.dto.AiQuestionRequest;
import com.skillforge.dto.AiQuestionResponse;
import com.skillforge.entity.Exam;
import com.skillforge.entity.Question;
import com.skillforge.repository.QuestionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiQuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Value("${app.ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;

    private static final Logger log = LoggerFactory.getLogger(AiQuestionService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    public AiQuestionService() {
        this.restTemplate = new RestTemplate();
    }

    private void logRequest(String url, AiQuestionRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);
            log.info("Calling AI service POST {} with payload: {}", url, payload);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize AI request for logging", e);
        }
    }

    private void logResponse(ResponseEntity<AiQuestionResponse> response) {
        try {
            String body = response.getBody() != null ? objectMapper.writeValueAsString(response.getBody()) : "null";
            log.info("AI service responded status={} body={}", response.getStatusCode(), body);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize AI response for logging", e);
        }
    }

    /**
     * Generate questions using AI service
     * 
     * @param courseName The name of the course
     * @param topic The topic for question generation
     * @param difficulty The difficulty level (easy, medium, hard)
     * @param numberOfQuestions Number of questions to generate
     * @return AiQuestionResponse containing generated questions
     */
    public AiQuestionResponse generateQuestions(String courseName, String topic,
                                                String difficulty, Integer numberOfQuestions) {
        // Prepare request
        AiQuestionRequest request = new AiQuestionRequest();
        request.setCourseName(courseName);
        request.setTopic(topic);
        request.setDifficulty(difficulty);
        request.setNumberOfQuestions(numberOfQuestions);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AiQuestionRequest> entity = new HttpEntity<>(request, headers);

        String url = aiServiceUrl + "/generate-questions"; // Ensure POST http://localhost:8001/generate-questions

        try {
            logRequest(url, request);
            ResponseEntity<AiQuestionResponse> response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.POST,
                entity,
                AiQuestionResponse.class
            );

            logResponse(response);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
            throw new RuntimeException("AI service returned status " + response.getStatusCode());

        } catch (HttpStatusCodeException httpEx) {
            log.error("AI service error: status={} body={}", httpEx.getStatusCode(), httpEx.getResponseBodyAsString());
            throw new RuntimeException("AI service error: " + httpEx.getStatusCode() + " - " + httpEx.getResponseBodyAsString(), httpEx);
        } catch (Exception e) {
            log.error("Error connecting to AI service", e);
            throw new RuntimeException("Error connecting to AI service: " + e.getMessage(), e);
        }
    }

    /**
     * Generate and save questions to an exam
     * 
     * @param exam The exam to add questions to
     * @param courseName The name of the course
     * @param topic The topic for question generation
     * @param difficulty The difficulty level
     * @param numberOfQuestions Number of questions to generate
     * @return List of saved Question entities
     */
    @Transactional
    public List<Question> generateAndSaveQuestions(Exam exam, String courseName, 
                                                   String topic, String difficulty, 
                                                   Integer numberOfQuestions) {
        // Generate questions from AI service
        AiQuestionResponse aiResponse = generateQuestions(courseName, topic, difficulty, numberOfQuestions);

        List<Question> savedQuestions = new ArrayList<>();
        
        if (aiResponse != null && aiResponse.getQuestions() != null) {
            int order = getNextQuestionOrder(exam);

            for (AiGeneratedQuestion aiQuestion : aiResponse.getQuestions()) {
                Question question = new Question();
                question.setExam(exam);
                question.setQuestionText(aiQuestion.getQuestion());
                question.setOptionA(aiQuestion.getOptionA());
                question.setOptionB(aiQuestion.getOptionB());
                question.setOptionC(aiQuestion.getOptionC());
                question.setOptionD(aiQuestion.getOptionD());
                question.setCorrectOption(aiQuestion.getCorrectOption());
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setMarks(1.0);
                question.setQuestionOrder(order++);

                Question savedQuestion = questionRepository.save(question);
                savedQuestions.add(savedQuestion);
            }
        }

        return savedQuestions;
    }

    /**
     * Get the next question order number for an exam
     */
    private int getNextQuestionOrder(Exam exam) {
        List<Question> existingQuestions = questionRepository.findByExam(exam);
        if (existingQuestions.isEmpty()) {
            return 1;
        }
        return existingQuestions.stream()
                .mapToInt(q -> q.getQuestionOrder() != null ? q.getQuestionOrder() : 0)
                .max()
                .orElse(0) + 1;
    }

    /**
     * Convert AI generated questions to Question entities (without saving)
     * Useful for preview before saving
     */
    public List<Question> convertToQuestionEntities(Exam exam, AiQuestionResponse aiResponse) {
        List<Question> questions = new ArrayList<>();
        
        if (aiResponse != null && aiResponse.getQuestions() != null) {
            int order = getNextQuestionOrder(exam);

            for (AiGeneratedQuestion aiQuestion : aiResponse.getQuestions()) {
                Question question = new Question();
                question.setExam(exam);
                question.setQuestionText(aiQuestion.getQuestion());
                question.setOptionA(aiQuestion.getOptionA());
                question.setOptionB(aiQuestion.getOptionB());
                question.setOptionC(aiQuestion.getOptionC());
                question.setOptionD(aiQuestion.getOptionD());
                question.setCorrectOption(aiQuestion.getCorrectOption());
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setMarks(1.0);
                question.setQuestionOrder(order++);

                questions.add(question);
            }
        }

        return questions;
    }
}
