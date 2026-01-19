import React, { useState } from 'react';
import { aiService } from '../services/aiService';

const difficulties = ['easy', 'medium', 'hard'];
const examTypes = ['multiple-choice'];

export default function AIQuestionGenerator({ onQuestionsGenerated }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [examType, setExamType] = useState('multiple-choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const res = await aiService.generateQuestions({
        topic,
        difficulty,
        num_questions: numQuestions,
        exam_type: examType,
      });
      setQuestions(res.questions || []);
      if (onQuestionsGenerated) onQuestionsGenerated(res.questions || []);
    } catch (err) {
      setError(err.response?.data?.detail?.message || err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-question-generator">
      <h2>AI Question Generator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Topic:</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} required />
        </div>
        <div>
          <label>Difficulty:</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label>Number of Questions:</label>
          <input type="number" min={1} max={20} value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} required />
        </div>
        <div>
          <label>Exam Type:</label>
          <select value={examType} onChange={e => setExamType(e.target.value)}>
            {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {questions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Generated Questions</h3>
          <ol>
            {questions.map((q, i) => (
              <li key={i}>
                <strong>{q.question}</strong>
                <ul>
                  {q.options.map((opt, j) => (
                    <li key={j}>{opt}{opt === q.correctAnswer ? ' (Correct)' : ''}</li>
                  ))}
                </ul>
                <div>Marks: {q.marks} | Difficulty: {q.difficulty}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
