import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import '../styles/auth.css';

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const registerData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password,
      };

      console.log('REGISTER DATA:', registerData);

      const response = await authAPI.register(registerData);

      console.log('REGISTER SUCCESS:', response.data);

      navigate('/login', {
        state: {
          message: 'Registration successful! Please login.',
        },
      });
    } catch (err) {
      console.error('========== REGISTER ERROR ==========');
      console.error('Status:', err.response?.status);
      console.error('Response:', err.response?.data);
      console.error('URL:', err.config?.url);
      console.error('Base URL:', err.config?.baseURL);
      console.error('Method:', err.config?.method);
      console.error('====================================');

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg || 'Invalid input')
            .join(', ')
        );
      } else {
        setError(
          detail ||
            `Registration failed (${err.response?.status || 'unknown error'})`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-header">
            <h1>💳 FinanceHub</h1>
            <p>Create Your Account</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            <Input
              type="text"
              placeholder="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              type="tel"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              type="text"
              placeholder="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}