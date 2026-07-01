import React, { useState } from 'react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/contact', { name, email, message });

      setName('');
      setEmail('');
      setMessage('');
      setHasError(false);
      setStatusMessage('Data added successfully.');
    } catch (error) {
      setHasError(true);
      setStatusMessage('Failed to add data to MongoDB.');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-form">
        <h1>Contact Us</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <input type="text" id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <textarea id="message" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
          {statusMessage && <p className={hasError ? 'error-p' : undefined}>{statusMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Contact;
