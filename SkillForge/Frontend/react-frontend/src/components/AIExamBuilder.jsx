<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { generateAIQuestions, saveAIQuestions } from '../api/examService';

/**
 * AI Exam Builder Component
 * 
 * Allows instructors to generate MCQ questions using AI and save them to exams.
 * Features:
 * - Select exam, course name, topic, difficulty, and number of questions
 * - Preview generated questions before saving
 * - Loading states and error handling
 * - Responsive design
 */
const AIExamBuilder = ({ exams, onQuestionsAdded }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form fields
  const [selectedExamId, setSelectedExamId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  // Generated questions preview
  const [previewQuestions, setPreviewQuestions] = useState(null);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Generate AI questions preview
   * Calls the AI service and displays questions for review
   */
  const handleGeneratePreview = async () => {
    // Reset states
    setError('');
    setSuccess('');
    setPreviewQuestions(null);

    // Clamp slider value to 1..100 to ensure backend gets the exact requested count
    const clampedCount = Math.min(100, Math.max(1, Number(numberOfQuestions) || 1));
    if (clampedCount !== numberOfQuestions) {
      setNumberOfQuestions(clampedCount);
    }

    // Validation
    if (!selectedExamId) {
      setError('⚠️ Please select an exam');
      return;
    }
    if (!courseName.trim()) {
      setError('⚠️ Please enter a course name');
      return;
    }
    if (!topic.trim()) {
      setError('⚠️ Please enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      // Call AI service to generate questions
      const response = await generateAIQuestions({
        courseName: courseName.trim(),
        topic: topic.trim(),
        difficulty,
        numberOfQuestions: clampedCount
      });

      // Display preview
      setPreviewQuestions(response.questions);
      setSuccess(`✅ Generated ${response.questions.length} questions! Review and approve to save.`);
    } catch (err) {
      setError(`❌ ${err.message || 'Failed to generate questions. Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Save approved questions to the selected exam
   */
  const handleApproveAndSave = async () => {
    if (!previewQuestions || previewQuestions.length === 0) {
      setError('⚠️ No questions to save');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Save questions to backend
      await saveAIQuestions(selectedExamId, previewQuestions);

      // Success!
      setSuccess(`✅ Successfully saved ${previewQuestions.length} questions to exam!`);
      
      // Clear preview after short delay
      setTimeout(() => {
        setPreviewQuestions(null);
        setCourseName('');
        setTopic('');
        setSuccess('');
        
        // Notify parent component
        if (onQuestionsAdded) {
          onQuestionsAdded(selectedExamId);
        }
      }, 2000);

    } catch (err) {
      setError(`❌ ${err.message || 'Failed to save questions. Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Clear preview and reset form
   */
  const handleClearPreview = () => {
    setPreviewQuestions(null);
    setError('');
    setSuccess('');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="section-block" data-section="ai-builder">
      <div style={{ marginBottom: '1rem' }}>
        <h2 className="section-block-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🤖</span>
          AI Exam Builder
        </h2>
        <p className="section-block-sub" style={{ margin: '0.25rem 0 0 0' }}>
          Generate high-quality MCQ questions using AI. Preview and approve before adding to your exams.
        </p>
      </div>

      <div className="card">
        {/* Error Display */}
        {error && (
          <div style={{ 
            padding: '1rem', 
            background: '#ffebee', 
            borderRadius: '8px', 
            border: '1px solid #ffcdd2',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d32f2f' }}>
              {error}
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div style={{ 
            padding: '1rem', 
            background: '#e8f5e9', 
            borderRadius: '8px', 
            border: '1px solid #c8e6c9',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2e7d32' }}>
              {success}
            </div>
          </div>
        )}

        {/* Generation Form */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
          {/* Select Exam */}
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Select Exam <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={isGenerating || isSaving}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Choose an exam --</option>
              {exams && exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.courseName})
                </option>
              ))}
            </select>
          </div>

          {/* Course Name */}
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Course Name <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Python Programming"
              disabled={isGenerating || isSaving}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Topic */}
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Topic <span style={{ color: '#d32f2f' }}>*</span>
            </label>
>>>>>>> TempBranch
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
<<<<<<< HEAD
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
=======
              placeholder="e.g., List Comprehensions"
              disabled={isGenerating || isSaving}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Difficulty <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isGenerating || isSaving}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem'
              }}
>>>>>>> TempBranch
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

<<<<<<< HEAD
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
=======
          {/* Number of Questions */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Number of Questions: <span style={{ color: '#3b82f6' }}>{numberOfQuestions}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              disabled={isGenerating || isSaving}
              style={{
                width: '100%'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleGeneratePreview}
            disabled={isGenerating || isSaving}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span>🎲</span>
                Generate Preview
              </>
            )}
          </button>

          {previewQuestions && (
            <>
              <button
                className="btn"
                onClick={handleApproveAndSave}
                disabled={isGenerating || isSaving}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Approve & Save
                  </>
                )}
              </button>

              <button
                className="btn btn-outline"
                onClick={handleClearPreview}
                disabled={isGenerating || isSaving}
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Questions Preview */}
        {previewQuestions && previewQuestions.length > 0 && (
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '1.5rem',
            border: '2px dashed #3b82f6'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📋</span>
              Preview: {previewQuestions.length} Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {previewQuestions.map((q, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '1rem', color: '#1a1a1a' }}>
                    Q{index + 1}. {q.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['A', 'B', 'C', 'D'].map(option => {
                      const optionText = q[`option${option}`];
                      const isCorrect = q.correctOption === option;

                      return (
                        <div 
                          key={option}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            border: `2px solid ${isCorrect ? '#16a34a' : '#e0e0e0'}`,
                            background: isCorrect ? '#f0fdf4' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <span style={{ 
                            fontWeight: '600',
                            color: isCorrect ? '#16a34a' : '#666',
                            minWidth: '24px'
                          }}>
                            {option}.
                          </span>
                          <span style={{ color: isCorrect ? '#166534' : '#333' }}>
                            {optionText}
                          </span>
                          {isCorrect && (
                            <span style={{ 
                              marginLeft: 'auto',
                              color: '#16a34a',
                              fontSize: '1.1rem'
                            }}>
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State During Generation */}
        {isGenerating && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #3b82f6'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              AI is generating your questions...
            </div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>
              This may take 10-20 seconds. Please wait.
            </div>
          </div>
        )}
      </div>

      {/* Inline Spinner Style */}
      <style>{`
        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
>>>>>>> TempBranch
        }
      `}</style>
    </div>
  );
};

export default AIExamBuilder;
