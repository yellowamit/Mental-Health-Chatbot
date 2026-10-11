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
  Check as CheckIcon,
  Cpu,
  ChevronDown,
  Clock,
  Hourglass
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
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Discord-style Slow Mode rate limit state
  const [slowModeSeconds, setSlowModeSeconds] = useState(5);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef(null);

  const startCooldown = (seconds) => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    const duration = Math.max(1, seconds || slowModeSeconds || 5);
    setCooldownRemaining(duration);

    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const [chatHistory, setChatHistory] = useState([
    {
      role: 'bot',
      message: "Hello, friend. I'm **WellBot**, your empathetic companion.\n\nTake a gentle breath. This is a safe, non-judgmental space to share what's on your mind. How are you feeling right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Gemini'
    }
  ]);

  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening: isListening
  } = useSpeechRecognition();

  // Fetch available models and server slow mode configuration
  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const res = await fetch(`${baseUrl}/models`);
        if (res.ok) {
          const data = await res.json();
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models);
          }
          if (data.slowModeSeconds) {
            setSlowModeSeconds(data.slowModeSeconds);
          }
        }
      } catch (err) {
        console.warn("Could not fetch models from server:", err);
        // Fallback default list
        setAvailableModels([
          { id: 'auto', name: 'Auto (Best Available)', description: 'Cascading fallback across active models' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast, responsive, & empathetic (Recommended)' },
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Next-generation speed & accuracy' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High reasoning & deeper emotional reflection' },
          { id: 'gemini-pro', name: 'Gemini Pro', description: 'Classic companion model' }
        ]);
      }
    };
    fetchAvailableModels();
  }, []);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel !== 'auto' ? selectedModel : 'Gemini'
        }
      ]);
      setUserInput('');
      resetTranscript();
    }
  };

  const handlePromptClick = (promptText) => {
    if (cooldownRemaining > 0 || isLoading) return;
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
    if (!text || isLoading || cooldownRemaining > 0) return;

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

    // Trigger Discord-style client cooldown immediately
    startCooldown(slowModeSeconds);

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const authToken = localStorage.getItem('auth-token');
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'auth-token': authToken } : {})
        },
        body: JSON.stringify({
          userInput: text,
          model: selectedModel
        }),
      });

      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        const retryWait = errData.retryAfter || slowModeSeconds || 5;
        startCooldown(retryWait);

        setChatHistory([
          ...updatedHistory,
          {
            role: 'bot',
            message: `⏳ **Mindful Slow Mode Active**\n\nTake a gentle, grounding breath... To help everyone reflect thoughtfully and prevent rush, messages have a **${slowModeSeconds}s** pause between them.\n\nYou can send your next message in **${retryWait} seconds**.`,
            modelUsed: 'WellBot Slowmode',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.response;
      const modelUsed = data.usedModel || (selectedModel !== 'auto' ? selectedModel : 'Gemini');

      if (data.slowModeSeconds) {
        setSlowModeSeconds(data.slowModeSeconds);
        // Refresh cooldown if server dictates a longer slow mode
        startCooldown(data.slowModeSeconds);
      }

      setChatHistory([
        ...updatedHistory,
        {
          role: 'bot',
          message: botMessage,
          modelUsed,
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
    if (cooldownRemaining > 0 || isLoading) return;
    sendMessage(userInput);
  };

  const currentModelDisplay = availableModels.find(m => m.id === selectedModel)?.name || 'Auto (Best Available)';

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
              {/* Dynamic Model Selector Dropdown */}
              <div className="model-selector-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="model-selector-btn"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  title="Choose which AI model powers the chat"
                >
                  <Cpu size={14} className="model-btn-icon" />
                  <span className="selected-model-name">{currentModelDisplay}</span>
                  <ChevronDown size={14} className={`dropdown-chevron ${isModelDropdownOpen ? 'open' : ''}`} />
                </button>

                {isModelDropdownOpen && (
                  <div className="model-dropdown-menu">
                    <div className="dropdown-header">
                      <Sparkles size={13} />
                      <span>Available AI Models</span>
                    </div>
                    <div className="model-options-list">
                      {availableModels.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`model-option-item ${selectedModel === m.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                        >
                          <div className="model-item-info">
                            <span className="model-item-title">{m.name}</span>
                            {m.description && <span className="model-item-desc">{m.description}</span>}
                          </div>
                          {selectedModel === m.id && <CheckIcon size={14} className="model-active-check" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Discord-style Slow Mode Chip */}
              <div
                className={`header-slowmode-badge ${cooldownRemaining > 0 ? 'cooling' : ''}`}
                title={`Slow mode active: ${slowModeSeconds}s reflection pause between messages`}
              >
                <Clock size={13} className="slowmode-badge-icon" />
                <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : `${slowModeSeconds}s slow`}</span>
              </div>

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
                      {isBot && item.modelUsed && (
                        <span className="model-used-chip" title="Model that generated this response">
                          ✦ {item.modelUsed}
                        </span>
                      )}
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
                    <span className="typing-text">
                      WellBot ({currentModelDisplay}) is listening and reflecting...
                    </span>
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
                    disabled={cooldownRemaining > 0 || isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form Bar */}
          <div className="chat-input-container">
            {/* Discord-style Slow Mode Bar */}
            <div className={`discord-slowmode-indicator ${cooldownRemaining > 0 ? 'cooling' : ''}`}>
              <div className="slowmode-indicator-left">
                <Hourglass size={13} className={`slowmode-status-icon ${cooldownRemaining > 0 ? 'ticking' : ''}`} />
                {cooldownRemaining > 0 ? (
                  <span className="slowmode-countdown-message">
                    Slowmode is active — you can send another message in <strong>{cooldownRemaining}s</strong>
                  </span>
                ) : (
                  <span className="slowmode-idle-message">
                    Slowmode is enabled ({slowModeSeconds}s)
                  </span>
                )}
              </div>
              {cooldownRemaining > 0 && (
                <div className="slowmode-mini-gauge" title={`${cooldownRemaining}s remaining`}>
                  <div
                    className="slowmode-gauge-bar"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((slowModeSeconds - cooldownRemaining) / slowModeSeconds) * 100))}%`
                    }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={`chat-modern-form ${cooldownRemaining > 0 ? 'form-slow-cooldown' : ''}`}>
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`mic-toggle-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                  disabled={cooldownRemaining > 0 || isLoading}
                >
                  {isListening ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              )}

              <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder={
                  cooldownRemaining > 0
                    ? `Slowmode active: pause for ${cooldownRemaining}s to send...`
                    : `Share what's on your mind with WellBot (${currentModelDisplay})...`
                }
                className={`chat-text-input ${cooldownRemaining > 0 ? 'input-cooling' : ''}`}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !userInput.trim() || cooldownRemaining > 0}
                className={`chat-send-btn ${cooldownRemaining > 0 ? 'btn-slowmode-locked' : ''}`}
                title={cooldownRemaining > 0 ? `Slowmode active: ${cooldownRemaining}s remaining` : "Send message"}
              >
                {cooldownRemaining > 0 ? (
                  <span className="slowmode-btn-content">
                    <Clock size={14} className="slowmode-btn-clock" />
                    <span className="slowmode-btn-num">{cooldownRemaining}s</span>
                  </span>
                ) : (
                  <Send size={18} />
                )}
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
          {/* Active AI Model Card */}
          <div className="support-card model-info-card">
            <div className="support-card-icon-box">
              <Cpu size={22} />
            </div>
            <h4>Active AI Model</h4>
            <div className="active-model-status-chip">
              <span className="status-live-dot" />
              <strong>{currentModelDisplay}</strong>
            </div>
            <p>
              Switch between fast models or deep reflection models anytime using the header selector above.
            </p>
          </div>

          {/* Mindful Slow Mode Pacing Card */}
          <div className="support-card slowmode-card">
            <div className="support-card-icon-box">
              <Hourglass size={22} />
            </div>
            <h4>Mindful Slow Mode ({slowModeSeconds}s)</h4>
            <p>
              A calming {slowModeSeconds}s pause between messages ensures intentional reflection and prevents spamming.
            </p>
            {cooldownRemaining > 0 ? (
              <div className="slowmode-sidebar-status cooling">
                <Clock size={13} />
                <span>Pause: <strong>{cooldownRemaining}s</strong> remaining</span>
              </div>
            ) : (
              <div className="slowmode-sidebar-status ready">
                <CheckIcon size={13} />
                <span>Ready to share thoughts</span>
              </div>
            )}
          </div>

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
