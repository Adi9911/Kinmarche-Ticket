import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>Kinmarche Ticketing System</h2>
        <h3 style={{ textAlign: 'center' }}>Login</h3>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email or Username</label>
            <input type="text" placeholder="Enter email or username" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
        </form>
        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
