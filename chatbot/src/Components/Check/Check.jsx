import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Check.css';
import FormattedMessage from '../Common/FormattedMessage';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  RotateCcw,
  CalendarCheck,
  ShieldAlert,
  Bot,
  User,
  Heart,
  Copy,
  Check as CheckIcon
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "I'm feeling really overwhelmed and anxious right now.",
  "Can you guide me through a quick calming exercise?",
  "I'm struggling with low motivation and feeling down.",
  "I feel lonely and just need a safe space to share.",
  "I'm having trouble sleeping because my thoughts won't stop."
];

function Check() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'bot',
      message: "Hello, friend. I'm **WellBot**, your empathetic companion.\n\nTake a gentle breath. This is a safe, non-judgmental space to share what's on your mind. How are you feeling right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening: isListening
  } = useSpeechRecognition();

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  // If voice transcript updates, sync with userInput
  useEffect(() => {
    if (transcript) {
      setUserInput(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setUserInput('');
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Would you like to start a fresh, mindful conversation?")) {
      setChatHistory([
        {
          role: 'bot',
          message: "Welcome back to your fresh start. Take a gentle breath. What would you like to reflect on today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setUserInput('');
      resetTranscript();
    }
  };

  const handlePromptClick = (promptText) => {
    setUserInput(promptText);
    sendMessage(promptText);
  };

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async (messageToSend) => {
    const text = (messageToSend || userInput).trim();
    if (!text || isLoading) return;

    if (isListening) {
      SpeechRecognition.stopListening();
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message immediately
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', message: text, timestamp: timeString }
    ];
    setChatHistory(updatedHistory);
    setUserInput('');
    resetTranscript();
    setIsLoading(true);

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: text }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.response;

      setChatHistory([
        ...updatedHistory,
        {
          role: 'bot',
          message: botMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory([
        ...updatedHistory,
        {
          role: 'bot',
          message: "I'm having a little trouble connecting with the server right now. Please know you're not alone. If you are experiencing distress, you can call **988** (US) or **+91-9820466726** (India) for immediate support.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(userInput);
  };

  return (
    <div className="wellness-chat-page">
      <div className="chat-layout-container">
        {/* Chat Window */}
        <div className="chat-card-window">
          {/* Header */}
          <div className="chat-window-header">
            <div className="bot-profile">
              <div className="bot-avatar-ring">
                <Bot size={22} className="bot-avatar-icon" />
                <span className="online-pulse-dot" />
              </div>
              <div className="bot-profile-info">
                <div className="bot-title-line">
                  <h3>WellBot Companion</h3>
                  <span className="secure-badge">Confidential & Empathetic</span>
                </div>
                <p className="bot-subtitle">Here to listen, reflect, and guide you with care</p>
              </div>
            </div>

            <div className="chat-header-actions">
              <Link to="/booking" className="quick-booking-link" title="Book a Session with a Therapist">
                <CalendarCheck size={16} />
                <span>Book Therapist</span>
              </Link>
              <button onClick={handleClearChat} className="header-icon-btn" title="Clear chat history">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages History */}
          <div className="chat-messages-scroll-area">
            {chatHistory.map((item, index) => {
              const isBot = item.role === 'bot';
              return (
                <div key={index} className={`message-bubble-wrapper ${isBot ? 'bot-wrapper' : 'user-wrapper'}`}>
                  <div className="message-avatar-col">
                    {isBot ? (
                      <div className="avatar-circle bot-avatar">
                        <Heart size={16} />
                      </div>
                    ) : (
                      <div className="avatar-circle user-avatar">
                        <User size={16} />
                      </div>
                    )}
                  </div>

                  <div className="message-content-col">
                    <div className="message-meta-header">
                      <span className="sender-name">{isBot ? 'WellBot' : 'You'}</span>
                      <span className="message-time">{item.timestamp}</span>
                    </div>

                    <div className={`message-body-box ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                      <FormattedMessage content={item.message} isBot={isBot} />
                    </div>

                    {isBot && (
                      <div className="message-action-row">
                        <button
                          className="msg-action-btn"
                          onClick={() => copyMessage(item.message, index)}
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckIcon size={13} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Reflecting Indicator */}
            {isLoading && (
              <div className="message-bubble-wrapper bot-wrapper loading-bubble-wrapper">
                <div className="message-avatar-col">
                  <div className="avatar-circle bot-avatar pulse-avatar">
                    <Sparkles size={16} />
                  </div>
                </div>
                <div className="message-content-col">
                  <div className="message-body-box bot-bubble typing-box">
                    <div className="typing-indicator-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="typing-text">WellBot is listening and reflecting...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Voice Transcript Floating Banner */}
          {isListening && (
            <div className="live-voice-banner">
              <div className="voice-wave-indicator">
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
              <span className="voice-status-text">
                {transcript ? `"${transcript}"` : "Listening... Speak naturally."}
              </span>
              <button onClick={toggleListening} className="stop-voice-pill">
                Stop
              </button>
            </div>
          )}

          {/* Quick Prompts Suggestions */}
          {chatHistory.length <= 2 && !isLoading && (
            <div className="starter-prompts-bar">
              <span className="starter-label">Try asking:</span>
              <div className="starter-chips-container">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="starter-chip"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form Bar */}
          <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-modern-form">
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`mic-toggle-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              )}

              <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder="Share how you're feeling, or ask for guidance..."
                className="chat-text-input"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="chat-send-btn"
                title="Send message"
              >
                <Send size={18} />
              </button>
            </form>

            <div className="chat-disclaimer-bar">
              <ShieldAlert size={13} className="disclaimer-icon" />
              <span>
                WellBot provides emotional support & mindfulness guidance. For medical emergencies or acute crisis, call <strong>988</strong> or <strong>112</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Supportive Side Cards */}
        <div className="chat-support-sidebar">
          {/* Therapy Booking Card */}
          <div className="support-card therapy-highlight-card">
            <div className="support-card-icon-box">
              <CalendarCheck size={22} />
            </div>
            <h4>Speak with a Licensed Therapist</h4>
            <p>Ready for deeper personalized care? Schedule a confidential counseling session today.</p>
            <Link to="/booking" className="sidebar-action-btn">
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Grounding Exercise Card */}
          <div className="support-card grounding-card">
            <h4>🌿 The 5-4-3-2-1 Grounding Rule</h4>
            <ul className="grounding-list">
              <li><strong>5</strong> things you can see around you</li>
              <li><strong>4</strong> things you can gently touch</li>
              <li><strong>3</strong> things you can hear right now</li>
              <li><strong>2</strong> things you can smell</li>
              <li><strong>1</strong> thing you are grateful for</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Check;
