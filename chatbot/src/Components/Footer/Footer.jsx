import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, ShieldAlert, LifeBuoy } from 'lucide-react';

function Footer() {
  return (
    <footer className="wellness-footer-wrapper">
      <div className="wellness-footer-container">
        {/* Top Crisis Strip */}
        <div className="footer-crisis-strip">
          <div className="crisis-strip-heading">
            <ShieldAlert size={20} className="crisis-strip-icon" />
            <div>
              <h4>Need Immediate Emotional Support?</h4>
              <p>Free, confidential help is available 24 hours a day, 7 days a week.</p>
            </div>
          </div>

          <div className="footer-hotline-pills">
            <a href="tel:988" className="footer-hotline-badge">
              <Phone size={13} />
              <span>US/CA: 988 Lifeline</span>
            </a>
            <a href="sms:741741?body=HOME" className="footer-hotline-badge">
              <LifeBuoy size={13} />
              <span>Text HOME to 741741</span>
            </a>
            <a href="tel:+919820466726" className="footer-hotline-badge">
              <Phone size={13} />
              <span>India: AASRA (+91-9820466726)</span>
            </a>
            <a href="tel:14416" className="footer-hotline-badge">
              <Phone size={13} />
              <span>Tele-MANAS (14416)</span>
            </a>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main-grid">
          {/* Col 1: Identity */}
          <div className="footer-col brand-col">
            <div className="footer-brand-title">
              <div className="footer-brand-icon">
                <Heart size={18} />
              </div>
              <span className="footer-brand-name">WellBot</span>
            </div>
            <p className="footer-brand-desc">
              Your empathetic digital companion for mental well-being, emotional reflection, and mindfulness.
              Supporting your healing journey with non-judgmental presence.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h5>Explore WellBot</h5>
            <ul className="footer-nav-list">
              <li><Link to="/home">Mindful Home</Link></li>
              <li><Link to="/check">Talk to WellBot AI</Link></li>
              <li><Link to="/booking">Book a Therapist</Link></li>
              <li><Link to="/login">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="footer-col">
            <h5>Contact & Support</h5>
            <div className="footer-contact-item">
              <Mail size={15} />
              <a href="mailto:mail2amikg@gmail.com">mail2amikg@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <Phone size={15} />
              <span>Emergency Help: 112 / 911</span>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="footer-disclaimer-box">
          <p>
            <strong>Medical & Safety Disclaimer:</strong> WellBot is an AI-powered conversational tool designed for self-care,
            reflection, and emotional encouragement. WellBot is not a licensed medical provider and does not provide clinical diagnoses,
            prescriptions, or emergency crisis care. If you are experiencing suicidal thoughts, self-harm impulses, or severe distress,
            please immediately call <strong>988</strong> (US/Canada), <strong>112</strong> (India/EU), or visit your nearest emergency room.
          </p>
        </div>

        {/* Copyright */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} WellBot Companion. Designed with compassion for mental well-being.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;