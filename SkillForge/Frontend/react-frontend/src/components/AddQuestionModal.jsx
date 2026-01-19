import { useState, useEffect } from 'react';
import { createQuestion } from '../api/examService';

const AddQuestionModal = ({ isOpen, onClose, exam, onSuccess }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    marks: '1',
    questionOrder: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        marks: '1',
        questionOrder: ''
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.questionText.trim()) {
      alert('⚠️ Question text is required');
      return;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim()) {
      alert('⚠️ At least options A and B are required');
      return;
    }

    // CHECK TOKEN ROLE BEFORE SUBMITTING
    const token = localStorage.getItem('skillforgeToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check authentication silently
        
        if (payload.role !== 'INSTRUCTOR') {
          alert(`❌ AUTHENTICATION ERROR\n\nYour role: ${payload.role}\nRequired role: INSTRUCTOR\n\nYou are logged in as a ${payload.role}, but you need to be logged in as an INSTRUCTOR to create questions.\n\nPlease:\n1. Logout\n2. Login with an INSTRUCTOR account\n3. Try again`);
          return;
        }
        
        if (Date.now() >= payload.exp * 1000) {
          alert('❌ Your session has expired. Please login again.');
          return;
        }
      } catch (e) {
      }
    }

    setSubmitting(true);
    try {
      const questionData = {
        questionText: formData.questionText.trim(),
        optionA: formData.optionA.trim(),
        optionB: formData.optionB.trim(),
        optionC: formData.optionC.trim() || null,
        optionD: formData.optionD.trim() || null,
        correctOption: formData.correctOption,
        questionType: formData.questionType || 'MULTIPLE_CHOICE',
        marks: parseFloat(formData.marks) || 1.0,
        questionOrder: formData.questionOrder ? parseInt(formData.questionOrder) : null
      };

      console.log('📝 Creating question for exam:', exam.id);
      console.log('Question data:', questionData);
      
      await createQuestion(exam.id, questionData);
      alert('✅ Question added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Failed to create question:', err);
      const errorMessage = err.message || 'Failed to add question. Please try again.';
      alert('❌ ' + errorMessage);
      
      // If it's a 403 error, provide additional guidance
      if (err.message && err.message.includes('403')) {
        alert('🔒 Authentication Issue:\n\n' +
          '1. Make sure you are logged in as an INSTRUCTOR\n' +
          '2. Try logging out and logging back in\n' +
          '3. Check the browser console for JWT token details');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Add Question to {exam?.title}</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Fill in the question details below. Options A and B are required.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Question Text */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                Question Text *
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                placeholder="Enter the question..."
                rows="3"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Option A *
                </label>
                <input
                  type="text"
                  name="optionA"
                  value={formData.optionA}
                  onChange={handleChange}
                  placeholder="First option"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Option B *
                </label>
                <input
                  type="text"
                  name="optionB"
                  value={formData.optionB}
                  onChange={handleChange}
                  placeholder="Second option"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Option C
                </label>
                <input
                  type="text"
                  name="optionC"
                  value={formData.optionC}
                  onChange={handleChange}
                  placeholder="Third option (optional)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Option D
                </label>
                <input
                  type="text"
                  name="optionD"
                  value={formData.optionD}
                  onChange={handleChange}
                  placeholder="Fourth option (optional)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Correct Option and Marks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Correct Option *
                </label>
                <select
                  name="correctOption"
                  value={formData.correctOption}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Marks
                </label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                  min="0.25"
                  step="0.25"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                  Question Order
                </label>
                <input
                  type="number"
                  name="questionOrder"
                  value={formData.questionOrder}
                  onChange={handleChange}
                  min="1"
                  placeholder="Auto"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-outline"
              style={{ minWidth: '100px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ minWidth: '100px' }}
            >
              {submitting ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
