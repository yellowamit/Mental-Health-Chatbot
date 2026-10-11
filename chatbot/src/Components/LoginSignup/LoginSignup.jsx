import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginSignup.css';
import { Heart, User, Mail, Lock, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

function LoginSignup() {
  const [mode, setMode] = useState("Login"); // "Login" or "Signup"
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    if (mode === "Signup" && !formData.username) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const endpoint = mode === "Login" ? `${baseUrl}/login` : `${baseUrl}/signup`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let responsedata;
      try {
        responsedata = await response.json();
      } catch (err) {
        responsedata = { success: false, error: "Server returned invalid response." };
      }

      if (responsedata && responsedata.success) {
        localStorage.setItem('auth-token', responsedata.token);
        navigate('/home');
      } else {
        setErrorMessage(
          responsedata?.error ||
          responsedata?.errors ||
          (mode === "Login" ? "Invalid email or password." : "Signup failed. Email may already be in use.")
        );
      }
    } catch (err) {
      console.error("Auth fetch error:", err);
      // For demo fallback if backend is offline
      setErrorMessage("Could not connect to authentication server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wellness-auth-page">
      <div className="auth-card-container">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-icon-circle">
            <Heart size={24} />
          </div>
          <h2>{mode === "Login" ? "Welcome Back" : "Begin Your Mindful Journey"}</h2>
          <p>
            {mode === "Login"
              ? "Sign in to access your safe emotional space and past sessions"
              : "Create a free, confidential account for your well-being"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-toggle-bar">
          <button
            type="button"
            className={`auth-toggle-tab ${mode === "Login" ? "active" : ""}`}
            onClick={() => {
              setMode("Login");
              setErrorMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-toggle-tab ${mode === "Signup" ? "active" : ""}`}
            onClick={() => {
              setMode("Signup");
              setErrorMessage("");
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="auth-form-fields">
          {mode === "Signup" && (
            <div className="auth-input-group">
              <label>Your Name</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                name="email"
                value={formData.email}
                onChange={changeHandler}
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                name="password"
                value={formData.password}
                onChange={changeHandler}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
            {mode === "Login" ? (
              <>
                <LogIn size={18} />
                <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="auth-card-footer">
          <div className="privacy-pill">
            <Sparkles size={14} />
            <span>100% Confidential & Secure</span>
          </div>
          <Link to="/" className="guest-return-link">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;