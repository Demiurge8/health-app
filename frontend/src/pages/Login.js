import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin, onRegistrationPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegistrationPage = () => {
    onRegistrationPage();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const config = {
      method: "post",
      url: "http://localhost:4000/login",
      data: {
        email,
        password,
      },
    };
  
    axios(config)
      .then((result) => {
        setError('');
        onLogin(result.data.email);
      })
      .catch((error) => {
        setError('Invalid username or password');
  
        setTimeout(() => {
          setError('');
        }, 3000);
      });
  };

  return (
    <div className="login-container">
      <div className="login-frame">
        <h1>Login</h1>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            variant="primary"
            className='login-frame-button'
            onClick={handleSubmit}
          >
            Login
          </button>
            <div className='login-reg'>
              <p>Don't have an account? Register here:</p>
              <button className='reg-button' onClick={handleRegistrationPage}>Register</button>
            </div>
            {error && <p className='error-p'>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
