import React, {useState} from 'react';
import axios from 'axios';
import './Registration.css';

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const config = {
    method: "post",
    url: "http://localhost:4000/register",
    data: {
      email,
      password
    },
  };

  const handleBack = () => {
    onRegister();
  };

  const handleRegister = (e) => {
    axios(config)
    .then((result) => {
      setError('');
    })
    .catch((error) => {
      setError('Invalid username or password');

      setTimeout(() => {
        setError('');
      }, 3000);
    })
  };

  return (
    <div className='register-container'>
      <div className='register-frame'>
        <h1> Register</h1>
        <form onSubmit={handleRegister}>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='register-frame-button' type="submit">Register</button>
          {error && <p className='error-p'>{error}</p>}
        </form>
        <p className="label-back">
          Already have an account?{' '}
          <button className="log-button" onClick={handleBack}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;