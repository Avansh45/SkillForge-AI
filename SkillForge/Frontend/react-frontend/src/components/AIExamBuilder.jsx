import React, { useState } from 'react';
import { examService } from '../services/examService';

const AIExamBuilder = ({ examId, onQuestionsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const response = await examService.generateAIQuestions({
        topic,
        difficulty,
        num_questions: numQuestions,
        exam_type: 'multiple-choice',
      });

      if (response.success && response.questions) {
        setGeneratedQuestions(response.questions);
        setShowPreview(true);
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.response?.data?.detail?.message || err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      for (const question of generatedQuestions) {
        await examService.addQuestion(examId, {
          ...question,
          examId: examId,
        });
      }
      
      if (onQuestionsGenerated) {
        onQuestionsGenerated(generatedQuestions);
      }
      
      setGeneratedQuestions([]);
      setShowPreview(false);
      setTopic('');
      setError(null);
      alert('All questions saved successfully!');
    } catch (err) {
      setError('Failed to save questions: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQuestion = async (index) => {
    try {
      setLoading(true);
      const response = await examService.generateAIQuestions({
        topic,
        difficulty,
        num_questions: 1,
        exam_type: 'multiple-choice',
      });

      if (response.success && response.questions && response.questions.length > 0) {
        const newQuestions = [...generatedQuestions];
        newQuestions[index] = response.questions[0];
        setGeneratedQuestions(newQuestions);
      }
    } catch (err) {
      setError('Failed to regenerate question: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-exam-builder">
      <h3>AI Question Generator</h3>
      
      {!showPreview ? (
        <form onSubmit={handleGenerate} className="generator-form">
          <div className="form-group">
            <label>Topic:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Python Programming)"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Questions (1-100):</label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </form>
      ) : (
        <div className="questions-preview">
          <div className="preview-header">
            <h4>Generated Questions ({generatedQuestions.length})</h4>
            <div className="preview-actions">
              <button onClick={handleSaveAll} disabled={loading} className="save-all-btn">
                Save All Questions
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedQuestions([]);
                }}
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="questions-list">
            {generatedQuestions.map((q, index) => (
              <div key={index} className="question-preview-card">
                <div className="question-header">
                  <h5>Question {index + 1}</h5>
                  <button
                    onClick={() => handleRegenerateQuestion(index)}
                    disabled={loading}
                    className="regenerate-btn"
                  >
                    🔄 Regenerate
                  </button>
                </div>
                <p className="question-text">{q.question}</p>
                <div className="options-list">
                  {q.options && q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`option ${option === q.correctAnswer ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {option === q.correctAnswer && <span className="correct-badge">✓ Correct</span>}
                    </div>
                  ))}
                </div>
                <div className="question-meta">
                  <span>Difficulty: {q.difficulty}</span>
                  <span>Marks: {q.marks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-exam-builder {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }

        .generator-form {
          max-width: 500px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .generate-btn,
        .save-all-btn,
        .cancel-btn,
        .regenerate-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .generate-btn {
          background: #4CAF50;
          color: white;
          width: 100%;
        }

        .generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .questions-preview {
          margin-top: 20px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .preview-actions {
          display: flex;
          gap: 10px;
        }

        .save-all-btn {
          background: #4CAF50;
          color: white;
        }

        .cancel-btn {
          background: #f44336;
          color: white;
        }

        .regenerate-btn {
          background: #2196F3;
          color: white;
          padding: 5px 10px;
          font-size: 12px;
        }

        .question-preview-card {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .question-text {
          font-size: 16px;
          margin-bottom: 10px;
        }

        .options-list {
          margin: 10px 0;
        }

        .option {
          padding: 8px;
          margin: 5px 0;
          border-radius: 4px;
          background: #f5f5f5;
        }

        .option.correct {
          background: #e8f5e9;
          border-left: 3px solid #4CAF50;
        }

        .correct-badge {
          color: #4CAF50;
          font-weight: bold;
          margin-left: 10px;
        }

        .question-meta {
          display: flex;
          gap: 15px;
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default AIExamBuilder;
