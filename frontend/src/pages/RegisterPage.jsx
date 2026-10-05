import React, { useState } from 'react';
import { User, Mail, Lock, Phone, BookOpen, Building, Sparkles } from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { IDCardIllustration } from '../assets/illustrations/IllustratedIcons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: 'Computer Science',
    year: '3',
    hostel: 'Hostel A',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.department,
        year: Number(formData.year) || 1,
        hostel: formData.hostel,
      });
      toast.success('Registration successful! Welcome to CampusFind.');
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrap fade-in">
      <div className="app-container register-inner">
        <div className="register-card blob-card-1">
          <div className="register-header text-center">
            <div className="header-icon-box animate-float">
              <IDCardIllustration size={72} />
            </div>
            <h2 className="register-title">Create Campus Account</h2>
            <p className="register-sub">
              Register with your college email to start reporting and recovering lost items.
            </p>
          </div>

          {error && <div className="register-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-two-col">
              <Input
                label="Full Name"
                placeholder="e.g. Parthvi Sharma"
                icon={User}
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <Input
                label="Campus Email"
                type="email"
                placeholder="e.g. student@campus.edu"
                icon={Mail}
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="form-two-col">
              <Input
                label="Password"
                type="password"
                placeholder="Create secure password"
                icon={Lock}
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                icon={Lock}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </div>

            <div className="form-three-col">
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                options={[
                  'Computer Science',
                  'Electronics & Comm',
                  'Mechanical Eng',
                  'Civil Eng',
                  'Biotech',
                  'Management Studies',
                ]}
              />

              <Select
                label="Year of Study"
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                options={[
                  { value: '1', label: '1st Year' },
                  { value: '2', label: '2nd Year' },
                  { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' },
                ]}
              />

              <Input
                label="Campus Hostel / Block"
                placeholder="e.g. Hostel B, Room 204"
                icon={Building}
                value={formData.hostel}
                onChange={(e) => handleChange('hostel', e.target.value)}
              />
            </div>

            <Input
              label="Contact Phone (Optional)"
              type="tel"
              placeholder="e.g. 9876543210"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              helperText="Only revealed to Security Admin during approved item claim verification."
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full register-submit-btn"
            >
              Complete Registration &amp; Go to Dashboard
            </Button>
          </form>

          <div className="register-footer text-center">
            <p className="login-prompt">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="login-link-btn"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-page-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 0;
        }
        .register-inner {
          max-width: 680px;
        }
        .register-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }
        .header-icon-box {
          margin-bottom: 0.75rem;
        }
        .register-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .register-sub {
          font-size: 0.92rem;
          color: var(--charcoal-600);
          max-width: 440px;
          margin: 0 auto 1.5rem auto;
        }
        .register-error-alert {
          background: #FDF2F2;
          border-left: 4px solid #E63946;
          color: #E63946;
          padding: 0.65rem 0.95rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          text-align: left;
        }
        .form-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-three-col {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.85rem;
        }
        .register-submit-btn {
          width: 100%;
          margin-top: 0.75rem;
        }
        .register-footer {
          margin-top: 1.5rem;
        }
        .login-prompt {
          font-size: 0.9rem;
          color: var(--charcoal-600);
          margin: 0;
        }
        .login-link-btn {
          background: transparent;
          border: none;
          color: var(--coral-500);
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
        }
        .login-link-btn:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .register-card {
            padding: 1.5rem;
          }
          .form-two-col, .form-three-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
