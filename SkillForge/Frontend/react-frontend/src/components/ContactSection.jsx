import React, { useRef } from 'react';

const ContactSection = ({ onSubmit }) => {
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: e.target.contactName.value.trim(),
      email: e.target.contactEmail.value.trim(),
      role: e.target.contactRole.value,
      message: e.target.contactMessage.value.trim(),
    };

    // basic front-end validation
    if (!payload.name || !payload.email || !payload.message) {
      alert('Please fill in all required fields.');
      return;
    }

    // if parent provided a handler, call it and wait for success indicator
    if (typeof onSubmit === 'function') {
      try {
        const result = onSubmit(payload);
        // support both sync boolean or Promise<boolean>
        const ok = result instanceof Promise ? await result : result;
        if (ok) {
          // reset the form after successful submit
          formRef.current?.reset();
        } else {
          // parent decided it failed — do not reset
        }
      } catch (err) {
        console.error('onSubmit error', err);
        alert('Something went wrong while sending your message.');
      }
      return;
    }

    // fallback behaviour (no parent handler): simple confirmation + reset
    alert('Thank you — your message has been received. We will contact you soon.');
    formRef.current?.reset();
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-heading">
          <h2>Contact & Demo</h2>
          <p>Have questions or want to try SkillForge with your batch? Drop a message and we'll get in touch.</p>
        </div>

        <div className="contact-grid">
<<<<<<< HEAD
          <div className="contact-info card">
            <p><strong>Email:</strong> contact@skillforge.ai</p>
            <p><strong>Use cases:</strong> College training, placement cells, coaching institutes, internal assessments.</p>
            <p><strong>Note:</strong> Dashboards for Students, Instructors, and Admins can be customised to your requirements.</p>
=======
          <div className="contact-info card" style={{ background: '#fff', boxShadow: '0 2px 16px 0 rgba(34,197,94,0.07)' }}>
            <h3 style={{ color: '#16a34a', marginBottom: 8 }}>Connect with SkillForge</h3>
            <p style={{ fontSize: '1.08rem', marginBottom: 10 }}>
              <strong>Empowering adaptive learning for everyone.</strong>
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>Email:</span> <a href="mailto:contact@skillforge.ai" style={{ color: '#16a34a', textDecoration: 'underline' }}>contact@skillforge.ai</a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>For:</span> Students, Instructors, Admins, Institutes
              </li>
              <li style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>Why SkillForge?</span> Personalized dashboards, AI-driven exams, real-time analytics, and seamless collaboration.
              </li>
              <li style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>Get a Demo:</span> Reach out to see SkillForge in action for your team or institution.
              </li>
            </ul>
            <div style={{ marginTop: 14, fontSize: '0.98rem', color: '#64748b' }}>
              <span style={{ fontWeight: 500, color: '#16a34a' }}>SkillForge</span> — Modern learning, made simple.
            </div>
>>>>>>> TempBranch
          </div>

          <div className="contact-form card">
            <form ref={formRef} onSubmit={handleSubmit} className="contact-form-inner">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">Name*</label>
                  <input type="text" id="contactName" name="contactName" required />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email*</label>
                  <input type="email" id="contactEmail" name="contactEmail" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactRole">I am a</label>
                  <select id="contactRole" name="contactRole" defaultValue="Student">
                    <option>Student</option>
                    <option>Instructor</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactMessage">Message*</label>
                <textarea id="contactMessage" name="contactMessage" required rows="5"></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Message
              </button>

              <p className="muted small" style={{ marginTop: 10 }}>
                Our team will get back to you with more details.
              </p>

              <p className="muted small" style={{ marginTop: 6 }}>
                By submitting this form, you agree to our <a href="/privacy">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
