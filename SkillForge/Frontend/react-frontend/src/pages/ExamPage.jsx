import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetails, getExamQuestionsForStudent, submitExam } from '../api/examService';
import { getUserSession } from '../utils/auth';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const currentUser = getUserSession();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [examStarted, timeRemaining]);

  const fetchExamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examData, questionsData] = await Promise.all([
        getExamDetails(examId),
        getExamQuestionsForStudent(examId)
      ]);
      
      setExam(examData);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      
      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        setError('No questions available for this exam');
      }
    } catch (err) {
      setError(err.message || 'Failed to load exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (!exam || questions.length === 0) return;
    setExamStarted(true);
    setTimeRemaining(exam.durationMinutes * 60); // Convert to seconds
    startTimeRef.current = new Date();
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionNavigate = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateTimeTaken = () => {
    if (!startTimeRef.current) return 0;
    const endTime = new Date();
    const timeDiff = (endTime - startTimeRef.current) / 1000 / 60; // Convert to minutes
    return Math.ceil(timeDiff);
  };

  // Score calculation moved to backend for security
  // Backend has access to correct answers

  const handleSubmitExam = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to submit the exam? This action cannot be undone.')) {
        return;
      }
    }

    setSubmitting(true);
    
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const timeTaken = calculateTimeTaken();

      const submissionData = {
        timeTakenMinutes: timeTaken,
        answers: answers
      };

      const resultData = await submitExam(examId, submissionData);
      setResult(resultData);
    } catch (err) {
      console.error('Failed to submit exam:', err);
      alert('❌ ' + (err.message || 'Failed to submit exam. Please try again.'));
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSubmitting(true);
    
    try {
      const timeTaken = exam.durationMinutes;

      const submissionData = {
        timeTakenMinutes: timeTaken,
        answers: answers
      };

      const resultData = await submitExam(examId, submissionData);
      setResult(resultData);
      alert('⏰ Time expired! Your exam has been automatically submitted.');
    } catch (err) {
      console.error('Auto-submit failed:', err);
      alert('❌ Time expired. Failed to auto-submit exam. Please contact support.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ fontSize: '1.5rem', fontWeight: '500' }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '600px', 
          padding: '3rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.75rem' }}>Error Loading Exam</h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.125rem' }}>{error}</p>
          <button 
            onClick={handleBackToDashboard}
            style={{
              padding: '1rem 2.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const percentage = result.percentage || 0;
    const isPassed = percentage >= 50;
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: isPassed 
          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
          : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
        padding: '2rem'
      }}>
        <div style={{ 
          maxWidth: '700px',
          width: '100%',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: isPassed 
              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {isPassed ? '🎉' : '📊'}
            </div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.25rem', fontWeight: '700' }}>
              {isPassed ? 'Congratulations!' : 'Exam Completed'}
            </h1>
            <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.95 }}>
              {exam.title}
            </p>
          </div>

          {/* Score Display */}
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(${isPassed ? '#11998e' : '#ee0979'} ${percentage * 3.6}deg, #e0e0e0 0deg)`,
              marginBottom: '2rem',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '3.5rem', fontWeight: '700', color: isPassed ? '#11998e' : '#ee0979' }}>
                  {percentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: '1rem', color: '#666', fontWeight: '500' }}>Score</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                  {result.correctAnswers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Correct Answers
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                  {result.wrongAnswers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Wrong Answers
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                  {result.totalQuestions}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Total Questions
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6' }}>
                  {result.timeTaken} min
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Time Taken
                </div>
              </div>
            </div>

            {/* Attempt Info */}
            <div style={{ 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: '#16a34a'
            }}>
              Attempt {result.attemptNumber} of {result.maxAttempts}
            </div>

            {/* Action Button */}
            <button 
              onClick={handleBackToDashboard}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (!examStarted) {
    const canAttempt = exam.canAttempt;
    const attemptsRemaining = exam.maxAttempts - exam.attemptCount;

    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#e5f7ec',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '800px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: '#16a34a',
            padding: '2rem',
            color: 'white'
          }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{exam.title}</h1>
            <p style={{ margin: 0, opacity: 0.95 }}>{exam.course?.title}</p>
          </div>

          {/* Content */}
          <div style={{ padding: '2rem' }}>
            {/* Description */}
            {exam.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Description</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{exam.description}</p>
              </div>
            )}

            {/* Exam Details */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Duration
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  {exam.durationMinutes} minutes
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Total Questions
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  {exam.totalQuestions}
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Attempts
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  {exam.attemptCount} / {exam.maxAttempts}
                </div>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Negative Marking
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  {exam.negativeMarking ? `Yes (-${exam.negativeMarkValue})` : 'No'}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ 
              padding: '1.5rem', 
              background: '#fff3e0', 
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#f57c00', fontSize: '1.125rem' }}>
                📋 Instructions
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', lineHeight: '1.8' }}>
                <li>Read each question carefully before answering</li>
                <li>You have {exam.durationMinutes} minutes to complete the exam</li>
                <li>The exam will auto-submit when time runs out</li>
                <li>You cannot pause or resume once started</li>
                {exam.negativeMarking && (
                  <li>Incorrect answers will deduct {exam.negativeMarkValue} marks</li>
                )}
                <li>Make sure you have a stable internet connection</li>
              </ul>
            </div>

            {/* Timing Info */}
            <div style={{ 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: '#16a34a'
            }}>
              <strong>Exam Window:</strong> {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleBackToDashboard}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>

              <button 
                onClick={handleStartExam}
                disabled={!canAttempt}
                style={{
                  flex: 2,
                  padding: '1rem',
                  background: canAttempt ? '#16a34a' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: canAttempt ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => canAttempt && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {!canAttempt && attemptsRemaining === 0 ? 'No Attempts Remaining' :
                 !canAttempt ? 'Exam Not Available' :
                 'Start Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Fixed Timer Header */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>{exam.title}</h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            Question: {currentQuestionIndex + 1} / {questions.length}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: timeRemaining < 300 ? '#e74c3c' : '#27ae60',
            fontFamily: 'monospace'
          }}>
            {formatTime(timeRemaining)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Time Remaining</div>
        </div>
      </div>

      {/* Exam Content */}
      <div style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '900px', margin: '0 auto', padding: '140px 2rem 120px' }}>
        {questions.length > 0 && (
          <>
            {/* Current Question */}
            <div style={{ 
              padding: '2rem', 
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50', lineHeight: '1.6' }}>
                  {questions[currentQuestionIndex]?.questionText}
                </h3>
              </div>

              {/* Answer Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionKey = `option${option}`;
                  const optionText = questions[currentQuestionIndex]?.[optionKey];
                  const isSelected = answers[questions[currentQuestionIndex]?.id] === option;
                  
                  if (!optionText) return null;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(questions[currentQuestionIndex]?.id, option)}
                      style={{
                        padding: '1rem 1.5rem',
                        background: isSelected ? '#e3f2fd' : '#f8f9fa',
                        border: isSelected ? '2px solid #2196f3' : '2px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '1rem',
                        color: '#2c3e50',
                        transition: 'all 0.2s',
                        fontWeight: isSelected ? '600' : 'normal'
                      }}
                      onMouseOver={(e) => !isSelected && (e.target.style.background = '#f0f0f0')}
                      onMouseOut={(e) => !isSelected && (e.target.style.background = '#f8f9fa')}
                    >
                      <span style={{ fontWeight: 'bold', marginRight: '0.75rem' }}>{option}.</span>
                      {optionText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentQuestionIndex === 0 ? '#e0e0e0' : '#667eea',
                  color: currentQuestionIndex === 0 ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                ← Previous
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentQuestionIndex === questions.length - 1 ? '#e0e0e0' : '#667eea',
                  color: currentQuestionIndex === questions.length - 1 ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            </div>

            {/* Question Navigator */}
            <div style={{ 
              padding: '1.5rem', 
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#666' }}>Question Navigator</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionNavigate(index)}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: isCurrent ? '#667eea' : isAnswered ? '#16a34a' : '#f0f0f0',
                        color: isCurrent || isAnswered ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <button 
            onClick={handleSubmitExam}
            disabled={submitting}
            style={{
              padding: '1rem 3rem',
              background: submitting ? '#ccc' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              minWidth: '200px'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
