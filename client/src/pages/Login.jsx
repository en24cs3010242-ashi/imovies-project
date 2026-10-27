import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/common/AlertBanner';
import { Film, LogIn, Lock, Mail, Shield, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoUser = () => {
    setEmail('alex@example.com');
    setPassword('Password@123');
    setError(null);
  };

  const autofillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="cinema-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-15 text-primary mb-2 shadow">
                <Film size={32} />
              </div>
              <h3 className="text-white fw-bold mb-1">Welcome Back</h3>
              <p className="text-secondary small mb-0">Sign in to your IMovies account</p>
            </div>

            <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

            {/* Autofill Demo Credentials */}
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4">
              <span className="text-muted small d-block mb-2 text-uppercase fw-semibold">
                Quick Demo Accounts:
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={autofillDemoUser}
                  className="btn btn-sm btn-cinema-secondary flex-fill d-flex align-items-center justify-content-center gap-1 small"
                >
                  <User size={13} /> Demo User
                </button>
                <button
                  type="button"
                  onClick={autofillDemoAdmin}
                  className="btn btn-sm btn-cinema-secondary flex-fill d-flex align-items-center justify-content-center gap-1 small text-warning"
                >
                  <Shield size={13} /> Demo Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    required
                    className="form-control cinema-input ps-5"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={16}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary">Password</label>
                <div className="position-relative">
                  <input
                    type="password"
                    required
                    className="form-control cinema-input ps-5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock
                    size={16}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
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
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center border-top border-secondary border-opacity-25 pt-3">
              <span className="text-secondary small">Don't have an account yet? </span>
              <Link to="/register" className="text-primary text-decoration-none small fw-semibold">
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

