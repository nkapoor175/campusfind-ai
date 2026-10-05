import React, { useState } from 'react';
import { Mail, Lock, Sparkles, Shield, UserCheck, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { CampusMascot } from '../assets/illustrations/IllustratedIcons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.student?.Name || 'Admin'}!`);
      if (res.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).then((res) => {
      toast.success(`Logged in as ${demoEmail.includes('admin') ? 'Security Admin' : 'Student'}`);
      onNavigate(demoEmail.includes('admin') ? 'admin-dashboard' : 'dashboard');
    });
  };

  return (
    <div className="login-page-wrap fade-in">
      <div className="app-container login-inner-container">
        <div className="login-card-container blob-card-1">
          {/* Left Hero / Mascot Column */}
          <div className="login-art-col">
            <div className="mascot-badge animate-float">
              <CampusMascot size={130} />
            </div>
            <h3 className="art-col-title">CampusFind AI</h3>
            <p className="art-col-desc">
              "Lost something? We'll help you find it."
            </p>
            <div className="quick-demo-accounts">
              <span className="demo-label">✨ Instant Demo Sign-In:</span>
              <button
                type="button"
                className="demo-btn student"
                onClick={() => handleQuickLogin('parthvi@campus.edu', 'password123')}
              >
                <UserCheck size={14} /> Parthvi (Student)
              </button>
              <button
                type="button"
                className="demo-btn admin"
                onClick={() => handleQuickLogin('admin@campus.edu', 'admin123')}
              >
                <Shield size={14} /> Security Admin
              </button>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="login-form-col">
            <div className="form-header">
              <h2 className="form-title">Welcome back 👋</h2>
              <p className="form-subtitle">
                Enter your campus student credentials to access your dashboard.
              </p>
            </div>

            {error && <div className="login-error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <Input
                label="Campus Email"
                type="email"
                placeholder="e.g., parthvi@campus.edu"
                icon={Mail}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={Lock}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="form-meta-row">
                <label className="remember-me">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Contact campus IT desk for password reset'); }} className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full submit-btn"
              >
                Sign In to CampusFind
              </Button>
            </form>

            <div className="form-footer">
              <p className="register-prompt">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="register-link-btn"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 0;
          min-height: calc(100vh - 200px);
        }
        .login-inner-container {
          max-width: 900px;
        }
        .login-card-container {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .login-art-col {
          background: linear-gradient(145deg, #FFF9F3, #FDEEE3);
          border-right: 1px solid var(--peach-200);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .mascot-badge {
          margin-bottom: 1.25rem;
          filter: drop-shadow(0 8px 16px rgba(224, 109, 83, 0.15));
        }
        .art-col-title {
          font-family: var(--font-display);
          font-size: 1.45rem;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .art-col-desc {
          font-size: 0.92rem;
          color: var(--coral-600);
          font-weight: 600;
          margin-bottom: 1.5rem;
          max-width: 240px;
        }
        .quick-demo-accounts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          max-width: 240px;
          background: #FFFFFF;
          padding: 0.95rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--peach-200);
          box-shadow: var(--shadow-sm);
        }
        .demo-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #934612;
          text-transform: uppercase;
        }
        .demo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-warm);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          background: var(--cream-soft);
          color: var(--charcoal-800);
          transition: all 0.15s;
        }
        .demo-btn:hover {
          transform: translateY(-1px);
        }
        .demo-btn.student:hover {
          background: var(--coral-100);
          border-color: var(--coral-500);
          color: var(--coral-600);
        }
        .demo-btn.admin:hover {
          background: var(--sage-100);
          border-color: var(--sage-500);
          color: var(--sage-600);
        }
        .login-form-col {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
        }
        .form-header {
          margin-bottom: 1.5rem;
        }
        .form-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .form-subtitle {
          font-size: 0.92rem;
          color: var(--charcoal-600);
          margin: 0;
        }
        .login-error-alert {
          background: #FDF2F2;
          border-left: 4px solid #E63946;
          color: #E63946;
          padding: 0.65rem 0.95rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .form-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--charcoal-600);
          cursor: pointer;
        }
        .forgot-link {
          color: var(--coral-500);
          font-weight: 600;
        }
        .submit-btn {
          width: 100%;
        }
        .form-footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        .register-prompt {
          font-size: 0.9rem;
          color: var(--charcoal-600);
          margin: 0;
        }
        .register-link-btn {
          background: transparent;
          border: none;
          color: var(--coral-500);
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
        }
        .register-link-btn:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .login-card-container {
            grid-template-columns: 1fr;
          }
          .login-art-col {
            padding: 2rem 1.5rem;
          }
          .login-form-col {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
