import React, { useEffect, useState } from 'react';
import './BeforeHome.css';
import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import BreathingWidget from '../Common/BreathingWidget';
import {
  MessageSquareHeart,
  CalendarCheck,
  Sparkles,
  Heart,
  ShieldCheck,
  RefreshCw,
  Quote,
  ArrowRight
} from 'lucide-react';

function BeforeHome() {
  const [thought, setThought] = useState({ joketext: "Take a deep breath. You are doing the best you can today." });
  const [isLoadingThought, setIsLoadingThought] = useState(false);

  const fetchThought = async () => {
    setIsLoadingThought(true);
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    try {
      const response = await fetch(`${baseUrl}/goodthoughts`);
      if (response.ok) {
        const data = await response.json();
        setThought(data);
      }
    } catch (e) {
      console.error("Error fetching thought:", e);
    } finally {
      setIsLoadingThought(false);
    }
  };

  useEffect(() => {
    fetchThought();
  }, []);

  return (
    <div className="wellness-landing-page">
      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-badge-pill">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Your Mindful Emotional Companion</span>
          </div>

          <h1 className="hero-title">
            A Safe Space to <span className="highlight-text">Breathe, Speak</span> & Heal.
          </h1>

          <p className="hero-description">
            WellBot is an empathetic, AI-powered mental health companion designed to listen without judgment,
            guide you through anxiety and stress, and connect you with professional care.
          </p>

          <div className="hero-cta-group">
            <Link to="/check" className="cta-primary-btn">
              <MessageSquareHeart size={18} />
              <span>Talk with WellBot</span>
            </Link>
            <Link to="/login" className="cta-secondary-btn">
              <span>Sign In / Join Us</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>100% Confidential</span>
            </div>
            <div className="trust-item">
              <Heart size={16} className="trust-icon" />
              <span>Empathetic AI Care</span>
            </div>
            <div className="trust-item">
              <CalendarCheck size={16} className="trust-icon" />
              <span>Licensed Counselors</span>
            </div>
          </div>
        </div>

        {/* Breathing Exercise Interactive Card */}
        <div className="hero-interactive-card">
          <BreathingWidget />
        </div>
      </section>

      {/* Daily Affirmation Card */}
      <section className="affirmation-section">
        <div className="affirmation-card">
          <div className="affirmation-icon-box">
            <Quote size={28} />
          </div>
          <div className="affirmation-content">
            <span className="affirmation-tag">Daily Mindful Thought</span>
            <p className="affirmation-text">"{thought.joketext}"</p>
            <span className="affirmation-note">— Take this feeling with you into your day</span>
          </div>
          <button
            onClick={fetchThought}
            className="refresh-thought-btn"
            title="Get another mindful thought"
            disabled={isLoadingThought}
          >
            <RefreshCw size={18} className={isLoadingThought ? 'spin-icon' : ''} />
            <span>New Thought</span>
          </button>
        </div>
      </section>

      {/* Wellness Pillars Section */}
      <section className="wellness-features-section">
        <div className="section-header-center">
          <h2>Holistic Well-being, Guided by Empathy</h2>
          <p>Explore tools designed to support your emotional health wherever you are on your journey.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper forest">
              <MessageSquareHeart size={24} />
            </div>
            <h3>Empathetic AI Companion</h3>
            <p>
              Engage in comforting, non-judgmental dialogue anytime. Whether dealing with work stress, sadness,
              or loneliness, WellBot is here to listen and reflect.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper teal">
              <Sparkles size={24} />
            </div>
            <h3>Mindfulness & Grounding</h3>
            <p>
              Access calming techniques, 4-4-4 rhythmic breathing, and the 5-4-3-2-1 grounding method to de-escalate
              panic and restore inner balance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper mint">
              <CalendarCheck size={24} />
            </div>
            <h3>Therapist Appointment Booking</h3>
            <p>
              Ready for specialized human care? Schedule personalized counseling appointments with licensed
              mental health professionals with our intuitive booking system.
            </p>
          </div>
        </div>
      </section>

      {/* Gentle Reassurance Banner */}
      <section className="gentle-banner-section">
        <div className="gentle-banner-card">
          <h3>Your feelings are worthy of care and attention.</h3>
          <p>
            You don't have to carry everything by yourself. Taking the first step to speak up is an act of deep courage.
          </p>
          <Link to="/check" className="banner-start-btn">
            Begin Your Conversation
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BeforeHome;