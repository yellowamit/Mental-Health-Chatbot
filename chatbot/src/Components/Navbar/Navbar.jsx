import React, { useState } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageSquareHeart, CalendarCheck, PhoneCall, LogOut, LogIn, Menu, X, ShieldAlert } from 'lucide-react';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const location = useLocation();

  const isAuthenticated = !!localStorage.getItem('auth-token');

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container">
          {/* Logo & Identity */}
          <Link to={isAuthenticated ? '/home' : '/'} className="navbar-brand">
            <div className="brand-icon-wrapper">
              <Heart className="brand-icon" size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-name">WellBot</span>
              <span className="brand-tagline">Mindful Companion</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-links">
            <Link
              to={isAuthenticated ? '/home' : '/'}
              className={`nav-link ${isActive('/home') || isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/check"
              className={`nav-link ${isActive('/check') || isActive('/chatbot') ? 'active' : ''}`}
            >
              <MessageSquareHeart size={16} />
              <span>Talk to WellBot</span>
            </Link>
            <Link
              to="/booking"
              className={`nav-link ${isActive('/booking') ? 'active' : ''}`}
            >
              <CalendarCheck size={16} />
              <span>Book Session</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Crisis Fast-Access Pill */}
            <button
              onClick={() => setCrisisModalOpen(true)}
              className="crisis-sos-btn"
              title="Immediate crisis help & emergency helplines"
            >
              <PhoneCall size={14} />
              <span>Crisis Support</span>
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="auth-btn logout-btn" title="Sign Out">
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            ) : (
              <Link to="/login" className="auth-btn login-btn">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <Link
              to={isAuthenticated ? '/home' : '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/home') || isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/check"
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/check') ? 'active' : ''}`}
            >
              <MessageSquareHeart size={18} />
              <span>Talk to WellBot</span>
            </Link>
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/booking') ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Book Session</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCrisisModalOpen(true);
              }}
              className="mobile-crisis-link"
            >
              <PhoneCall size={18} />
              <span>Emergency & Crisis Helplines</span>
            </button>
            <div className="mobile-auth-wrapper">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="mobile-auth-btn">
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-auth-btn"
                >
                  <LogIn size={16} />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Quick Crisis Support Modal */}
      {crisisModalOpen && (
        <div className="crisis-modal-overlay" onClick={() => setCrisisModalOpen(false)}>
          <div className="crisis-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="crisis-modal-header">
              <div className="crisis-header-icon-box">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3>Immediate Crisis & Helpline Support</h3>
                <p>Free, confidential, 24/7 care from trained counselors</p>
              </div>
              <button
                className="crisis-close-btn"
                onClick={() => setCrisisModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="crisis-modal-list">
              <div className="crisis-item">
                <div className="crisis-info">
                  <strong>988 Suicide & Crisis Lifeline</strong>
                  <span>United States & Canada • Call or text anytime</span>
                </div>
                <a href="tel:988" className="crisis-call-pill">Call 988</a>
              </div>

              <div className="crisis-item">
                <div className="crisis-info">
                  <strong>Crisis Text Line</strong>
                  <span>Text HOME to 741741 • Free 24/7 support</span>
                </div>
                <a href="sms:741741?body=HOME" className="crisis-call-pill">Text 741741</a>
              </div>

              <div className="crisis-item">
                <div className="crisis-info">
                  <strong>AASRA Suicide Helpline</strong>
                  <span>India • 24/7 Confidential Listening</span>
                </div>
                <a href="tel:+919820466726" className="crisis-call-pill">+91 98204 66726</a>
              </div>

              <div className="crisis-item">
                <div className="crisis-info">
                  <strong>Tele-MANAS & Kiran</strong>
                  <span>Government of India Mental Health Helplines</span>
                </div>
                <a href="tel:14416" className="crisis-call-pill">Call 14416</a>
              </div>

              <div className="crisis-item">
                <div className="crisis-info">
                  <strong>Emergency Medical Services</strong>
                  <span>Immediate physical danger or emergency</span>
                </div>
                <a href="tel:112" className="crisis-call-pill ems">Call 112 / 911</a>
              </div>
            </div>

            <div className="crisis-modal-footer">
              <p>You are worthy of support and peace. Please don't hesitate to reach out to these professionals.</p>
              <button className="modal-done-btn" onClick={() => setCrisisModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;