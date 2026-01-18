package com.skillforge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiQuestionResponse {
    private List<AiGeneratedQuestion> questions;
    private String courseName;
    private String topic;
    private String difficulty;
    private Integer count;
}
