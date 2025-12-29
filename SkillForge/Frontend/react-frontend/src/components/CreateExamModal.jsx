import { useState, useEffect } from 'react';
import { createExam } from '../api/examService';

const CreateExamModal = ({ isOpen, onClose, courses, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    startTime: '',
    endTime: '',
    durationMinutes: '',
    totalQuestions: '',
    maxAttempts: '1',
    negativeMarking: false,
    negativeMarkValue: '0.25'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        description: '',
        courseId: '',
        startTime: '',
        endTime: '',
        durationMinutes: '',
        totalQuestions: '',
        maxAttempts: '1',
        negativeMarking: false,
        negativeMarkValue: '0.25'
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('⚠️ Exam title is required');
      return;
    }
    if (!formData.courseId) {
      alert('⚠️ Please select a course');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data for backend
      const examData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        courseId: parseInt(formData.courseId),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
        totalQuestions: formData.totalQuestions ? parseInt(formData.totalQuestions) : null,
        maxAttempts: formData.maxAttempts ? parseInt(formData.maxAttempts) : 1,
        negativeMarking: formData.negativeMarking,
        negativeMarkValue: formData.negativeMarking ? parseFloat(formData.negativeMarkValue) : 0
      };

      await createExam(examData);
      onSuccess();
      onClose();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to create exam. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Create New Exam</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Fill in the details below to create a new exam for your course.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Java OOP Mid-term Exam"
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

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the exam"
                rows="3"
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

            {/* Course Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
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
                <option value="">Select a course</option>
                {courses && courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date/Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
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

            {/* Exam Settings Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Duration (mins)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  placeholder="60"
                  min="1"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Total Questions
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Max Attempts
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min="1"
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

            {/* Negative Marking */}
            <div style={{ 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="negativeMarking"
                    checked={formData.negativeMarking}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Enable Negative Marking</span>
                </label>
              </div>
              
              {formData.negativeMarking && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Negative Mark Value
                  </label>
                  <input
                    type="number"
                    name="negativeMarkValue"
                    value={formData.negativeMarkValue}
                    onChange={handleChange}
                    step="0.25"
                    min="0"
                    max="1"
                    style={{
                      width: '150px',
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    marks per wrong answer
                  </span>
                </div>
              )}
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
              {submitting ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
