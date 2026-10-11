import React, { useEffect, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import BreathingWidget from '../Common/BreathingWidget';
import {
  MessageSquareHeart,
  CalendarCheck,
  Quote,
  RefreshCw,
  Sparkles,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

function Home() {
  const [thought, setThought] = useState({
    joketext: "Once you replace negative thoughts with positive ones, you'll start having positive results."
  });
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
    <div className="wellness-home-dashboard">
      {/* Top Welcome Banner */}
      <section className="dashboard-hero-section">
        <div className="dashboard-hero-content">
          <div className="dashboard-pill">
            <Sparkles size={14} />
            <span>Well-being Sanctuary</span>
          </div>

          <h1 className="dashboard-title">
            Welcome to Your <span className="sage-gradient-text">Safe Space</span>
          </h1>

          <p className="dashboard-subtitle">
            Whether you need a listening ear, grounding techniques for anxious moments, or professional therapy support,
            WellBot is always right here with you.
          </p>

          <div className="dashboard-action-buttons">
            <Link to="/check" className="dash-primary-btn">
              <MessageSquareHeart size={18} />
              <span>Talk to WellBot AI</span>
            </Link>
            <Link to="/booking" className="dash-secondary-btn">
              <CalendarCheck size={18} />
              <span>Book a Therapist</span>
            </Link>
          </div>
        </div>

        {/* Live Breathing Widget */}
        <div className="dashboard-widget-container">
          <BreathingWidget />
        </div>
      </section>

      {/* Daily Reflection Affirmation */}
      <section className="dashboard-affirmation-container">
        <div className="affirmation-card">
          <div className="affirmation-icon-box">
            <Quote size={26} />
          </div>
          <div className="affirmation-content">
            <span className="affirmation-tag">Today's Mindful Thought</span>
            <p className="affirmation-text">"{thought.joketext}"</p>
            <span className="affirmation-note">Let this thought bring peace and reassurance to your mind</span>
          </div>
          <button
            onClick={fetchThought}
            className="refresh-thought-btn"
            title="Refresh thought"
            disabled={isLoadingThought}
          >
            <RefreshCw size={17} className={isLoadingThought ? 'spin-icon' : ''} />
            <span>New Thought</span>
          </button>
        </div>
      </section>

      {/* Mindful Pillars & Resources */}
      <section className="dashboard-features-section">
        <div className="section-title-wrapper">
          <h2>Your Emotional Health Toolkit</h2>
          <p>Gentle tools curated to help you nurture mental calm, self-compassion, and resilience.</p>
        </div>

        <div className="dashboard-cards-grid">
          <div className="dash-card">
            <div className="dash-card-icon-box forest">
              <MessageSquareHeart size={24} />
            </div>
            <h3>Empathetic AI Dialogue</h3>
            <p>
              Engage in compassionate, confidential dialogue. WellBot recognizes feelings of anxiety, loneliness,
              and overwhelm, responding with empathy and tailored self-care guidance.
            </p>
            <Link to="/check" className="card-link">
              <span>Start chatting</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon-box teal">
              <Activity size={24} />
            </div>
            <h3>Mindfulness & Grounding</h3>
            <p>
              De-escalate stress in real time with proven mindfulness techniques like rhythmic box breathing,
              sensory grounding, and compassionate affirmations.
            </p>
            <div className="card-tag-badge">Self-paced & Instant</div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon-box mint">
              <CalendarCheck size={24} />
            </div>
            <h3>Certified Counselor Sessions</h3>
            <p>
              When human empathy and clinical care are needed, book appointments with vetted mental health
              counselors across various specialties.
            </p>
            <Link to="/booking" className="card-link">
              <span>Schedule appointment</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Reassurance Note */}
      <section className="reassurance-container">
        <div className="reassurance-card">
          <div className="reassurance-badge">
            <ShieldCheck size={18} />
            <span>Confidential & Private</span>
          </div>
          <h3>"You are allowed to take up space. You are allowed to take time to heal."</h3>
          <p>
            Your mental health matters every single day. If things feel overwhelming right now, take one gentle breath at a time.
          </p>
          <div className="reassurance-cta">
            <Link to="/check" className="reassurance-btn">
              Begin Today's Check-in
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;