// Service to call the AI Question Generation API
import axios from 'axios';

const AI_API_BASE_URL = 'http://localhost:8000'; // Update if deployed elsewhere

export const aiService = {
  generateQuestions: async ({ topic, difficulty, num_questions, exam_type }) => {
    const response = await axios.post(`${AI_API_BASE_URL}/generate-questions`, {
      topic,
      difficulty,
      num_questions,
      exam_type,
    });
    return response.data;
  },
};

export default aiService;
