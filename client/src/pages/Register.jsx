import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/common/AlertBanner';
import { Film, UserPlus, Lock, Mail, User, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="cinema-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-15 text-primary mb-2 shadow">
                <Film size={32} />
              </div>
              <h3 className="text-white fw-bold mb-1">Create Account</h3>
              <p className="text-secondary small mb-0">Join IMovies for seamless cinema bookings</p>
            </div>

            <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary">Full Name</label>
                <div className="position-relative">
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control cinema-input ps-5"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <User
                    size={16}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-control cinema-input ps-5"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <Mail
                    size={16}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">Phone Number (Optional)</label>
                <div className="position-relative">
                  <input
                    type="tel"
                    name="phone"
                    className="form-control cinema-input ps-5"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Phone
                    size={16}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small text-secondary">Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      required
                      name="password"
                      className="form-control cinema-input ps-5"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <Lock
                      size={16}
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      required
                      name="confirmPassword"
                      className="form-control cinema-input ps-5"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <Lock
                      size={16}
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-cinema-primary w-100 justify-content-center py-2 mb-3"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center border-top border-secondary border-opacity-25 pt-3">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-primary text-decoration-none small fw-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

