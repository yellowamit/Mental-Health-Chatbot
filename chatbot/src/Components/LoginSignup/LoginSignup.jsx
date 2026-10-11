import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginSignup.css';
import {
  Heart,
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Official Google Logo SVG
const GoogleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
  </svg>
);


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

  // Verify authentic OAuth token with backend server
  const verifyOAuthWithBackend = useCallback(async (provider, token) => {
    setIsSubmitting(true);
    setErrorMessage("");
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${baseUrl}/social-login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          token
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('auth-token', data.token);
        if (data.user) {
          localStorage.setItem('user-info', JSON.stringify(data.user));
        }
        navigate('/home');
      } else {
        setErrorMessage(data?.error || `Failed to authenticate with ${provider}. Verification rejected.`);
      }
    } catch (err) {
      console.error("OAuth verification fetch error:", err);
      setErrorMessage(`Failed to verify ${provider} OAuth credentials with server.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  // Dynamically load Google Identity Services SDK
  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (googleClientId && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  // Legitimate Google Sign-In Flow
  const handleGoogleLogin = () => {
    setErrorMessage("");
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId.includes('your_google_client_id')) {
      setErrorMessage(
        "Google OAuth requires a registered client ID. Please set REACT_APP_GOOGLE_CLIENT_ID in chatbot/.env"
      );
      return;
    }

    if (window.google?.accounts?.oauth2) {
      // Use Google OAuth 2.0 Token Client (Popup flow)
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMessage(`Google Sign-In failed: ${tokenResponse.error}`);
            return;
          }
          if (tokenResponse.access_token) {
            verifyOAuthWithBackend('google', tokenResponse.access_token);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } else if (window.google?.accounts?.id) {
      // Fallback to Google GSI Credential ID Token prompt
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            verifyOAuthWithBackend('google', response.credential);
          }
        }
      });
      window.google.accounts.id.prompt();
    } else {
      setErrorMessage("Google Sign-In service is loading. Please check your internet connection.");
    }
  };

  // Traditional Email/Password Form submission
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

        {/* Official OAuth 2.0 Providers */}
        <div className="social-auth-section">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="social-btn google-btn"
            disabled={isSubmitting}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Email & Password Form */}
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
                <span>{isSubmitting ? "Signing In..." : "Sign In with Email"}</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>{isSubmitting ? "Creating Account..." : "Create Account with Email"}</span>
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