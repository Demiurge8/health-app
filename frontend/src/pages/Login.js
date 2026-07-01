import React, { useState } from 'react';
import api from '../services/api';
import './Login.css';

const Login = ({ onLogin, onRegistrationPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegistrationPage = () => {
    onRegistrationPage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await api.post('/login', { email, password });

      setError('');
      onLogin({
        email: result.data.email,
        token: result.data.token,
      });
    } catch (error) {
      setError('Invalid username or password');

      setTimeout(() => {
        setError('');
      }, 3000);
    }
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
          >
            Login
          </button>
            <div className='login-reg'>
              <p>Don't have an account? Register here:</p>
              <button className='reg-button' type="button" onClick={handleRegistrationPage}>Register</button>
            </div>
            {error && <p className='error-p'>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
