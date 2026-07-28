"use client";
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Download } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const router = useRouter();
  const { login } = useContext(AppContext);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

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

          {deferredPrompt && (
            <button 
              type="button" 
              className="btn-primary login-btn" 
              style={{ marginTop: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleInstallClick}
            >
              <Download size={18} /> Install App
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
