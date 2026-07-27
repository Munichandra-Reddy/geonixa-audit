"use client";
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'jithendravarma.l@gmail.com' && password === 'varma@123') {
      setError('');
      login();
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-icon">
            <ShieldCheck size={40} color="var(--primary-color)" />
          </div>
          <h1>Geonixa Audit</h1>
          <p>Secure Portal Login</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="admin@geonixa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
