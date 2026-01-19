package com.skillforge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiQuestionRequest {
    private String courseName;
    private String topic;
    private String difficulty; // easy, medium, hard
    private Integer numberOfQuestions;
}
