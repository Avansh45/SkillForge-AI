import { useState, useEffect } from 'react';
import { getExamQuestionsForInstructor, updateQuestion, deleteQuestion } from '../api/examService';

const ManageQuestionsModal = ({ isOpen, onClose, exam }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (isOpen && exam) {
      fetchQuestions();
    }
  }, [isOpen, exam]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getExamQuestionsForInstructor(exam.id);
      setQuestions(data);
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to load questions'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setEditForm({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctOption: question.correctOption,
      marks: question.marks,
      questionOrder: question.questionOrder || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (questionId) => {
    try {
      const updateData = {
        questionText: editForm.questionText.trim(),
        optionA: editForm.optionA.trim(),
        optionB: editForm.optionB.trim(),
        optionC: editForm.optionC.trim() || null,
        optionD: editForm.optionD.trim() || null,
        correctOption: editForm.correctOption,
        questionType: editForm.questionType || 'MULTIPLE_CHOICE',
        marks: parseFloat(editForm.marks),
        questionOrder: editForm.questionOrder ? parseInt(editForm.questionOrder) : null
      };

      await updateQuestion(questionId, updateData);
      alert('✅ Question updated successfully!');
      setEditingId(null);
      setEditForm({});
      fetchQuestions();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to update question'));
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      alert('✅ Question deleted successfully!');
      fetchQuestions();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to delete question'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '1000px', width: '95%', maxHeight: '90vh', overflow: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Manage Questions - {exam?.title}</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {loading ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p>No questions added yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Use the "Add Question" button to create questions for this exam.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q, index) => (
              <div 
                key={q.id} 
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  backgroundColor: editingId === q.id ? '#f8f9fa' : 'white'
                }}
              >
                {editingId === q.id ? (
                  // Edit Mode
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                        Question Text
                      </label>
                      <textarea
                        value={editForm.questionText}
                        onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                        rows="2"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Option A
                        </label>
                        <input
                          type="text"
                          value={editForm.optionA}
                          onChange={(e) => setEditForm({ ...editForm, optionA: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Option B
                        </label>
                        <input
                          type="text"
                          value={editForm.optionB}
                          onChange={(e) => setEditForm({ ...editForm, optionB: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Option C
                        </label>
                        <input
                          type="text"
                          value={editForm.optionC}
                          onChange={(e) => setEditForm({ ...editForm, optionC: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Option D
                        </label>
                        <input
                          type="text"
                          value={editForm.optionD}
                          onChange={(e) => setEditForm({ ...editForm, optionD: e.target.value })}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Correct Option
                        </label>
                        <select
                          value={editForm.correctOption}
                          onChange={(e) => setEditForm({ ...editForm, correctOption: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Marks
                        </label>
                        <input
                          type="number"
                          value={editForm.marks}
                          onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          Order
                        </label>
                        <input
                          type="number"
                          value={editForm.questionOrder}
                          onChange={(e) => setEditForm({ ...editForm, questionOrder: e.target.value })}
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

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-outline"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(q.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            Q{index + 1}
                          </span>
                          <span style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {q.marks} marks
                          </span>
                        </div>
                        <p style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.5' }}>
                          {q.questionText}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          onClick={() => handleEdit(q)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="btn"
                          style={{ 
                            fontSize: '0.85rem', 
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { label: 'A', text: q.optionA },
                        { label: 'B', text: q.optionB },
                        { label: 'C', text: q.optionC },
                        { label: 'D', text: q.optionD }
                      ].map(opt => opt.text && (
                        <div 
                          key={opt.label}
                          style={{
                            padding: '0.75rem',
                            border: opt.label === q.correctOption ? '2px solid #28a745' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            backgroundColor: opt.label === q.correctOption ? '#d4edda' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span style={{
                            fontWeight: '700',
                            color: opt.label === q.correctOption ? '#28a745' : '#666',
                            minWidth: '25px'
                          }}>
                            {opt.label}.
                          </span>
                          <span style={{ 
                            color: opt.label === q.correctOption ? '#155724' : '#333',
                            fontWeight: opt.label === q.correctOption ? '500' : '400'
                          }}>
                            {opt.text}
                          </span>
                          {opt.label === q.correctOption && (
                            <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ minWidth: '120px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestionsModal;
