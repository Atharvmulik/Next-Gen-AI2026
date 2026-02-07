import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, BookOpen, GraduationCap, X } from 'lucide-react';
import { loginUser, registerUser } from "../services/auth";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!isLogin) {
      if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match!");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        console.log("LOGIN SUCCESS:", res.data);
        
        // Store token if your API returns one
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        alert("Login successful");
        navigate('/dashboard'); // Redirect to dashboard after login

      } else {
        const res = await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        console.log("REGISTER SUCCESS:", res.data);
        
        // Auto-login after registration if your API supports it
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        alert("Registration successful");
        navigate('/dashboard'); // Redirect after registration
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert(err.response?.data?.detail || err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    });
    navigate(`?mode=${isLogin ? 'signup' : 'login'}`);
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="glass-card auth-card animate-fade-in">

          {/* Header Toggle */}
          <div className="auth-header">
            <h2 className="title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="subtitle">
              {isLogin
                ? 'Login to access your personalized guidance.'
                : 'Join us to shape your academic future.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <Phone size={20} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-pass">Forgot Password?</a>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="link-btn"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 1rem 2rem;
        }

        .auth-container {
          width: 100%;
          max-width: 480px;
        }

        .auth-card {
          padding: 2.5rem;
          width: 100%;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .role-selector {
          display: flex;
          padding: 4px;
          border-radius: var(--radius-full);
          margin-bottom: 2rem;
        }

        .role-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .role-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .input-group {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: white;
          font-family: inherit;
          transition: var(--transition-fast);
          appearance: none;
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .auth-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .forgot-pass {
          color: var(--primary);
        }

        .btn-block {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .link-btn {
          color: var(--primary);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
        }

        .link-btn:hover:not(:disabled) {
          text-decoration: underline;
        }

        .link-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}