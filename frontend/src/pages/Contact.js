
import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css'; // Import the CSS file for styling

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const data = { name, email, message };

    axios
      .post('http://localhost:4000/add', data)
      .then((response) => {
        // Handle success response (optional)
        console.log(response.data);
        alert('Data added successfully.');
      })
      .catch((error) => {
        // Handle error response (optional)
        console.error(error);
        alert('Failed to add data to MongoDB.');
      });
  };

  return (
    <div className="contact-container">
      <div className="contact-form">
        <h1>Contact Us</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <input type="text" id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <input type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <textarea id="message" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;