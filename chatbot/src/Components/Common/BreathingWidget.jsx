import React, { useState, useEffect } from 'react';
import './BreathingWidget.css';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

function BreathingWidget() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Ready'); // 'Inhale', 'Hold', 'Exhale', 'Ready'
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let timer = null;

    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Transition phases
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 4;
            } else {
              setPhase('Inhale');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleToggle = () => {
    if (!isActive) {
      setPhase('Inhale');
      setSecondsLeft(4);
      setIsActive(true);
    } else {
      setIsActive(false);
      setPhase('Paused');
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('Ready');
    setSecondsLeft(4);
    setCyclesCompleted(0);
  };

  return (
    <div className="breathing-widget-card">
      <div className="breathing-header">
        <div className="breathing-title-group">
          <Wind size={20} className="wind-icon" />
          <div>
            <h4>Mindful Breathing</h4>
            <p className="breathing-subtext">Ground yourself with a 4-4-4 rhythm</p>
          </div>
        </div>
        {cyclesCompleted > 0 && (
          <span className="cycle-counter">{cyclesCompleted} {cyclesCompleted === 1 ? 'breath' : 'breaths'}</span>
        )}
      </div>

      <div className="breathing-visual-area">
        <div className={`breathing-circle-outer ${isActive ? phase.toLowerCase() : ''}`}>
          <div className="breathing-circle-inner">
            <span className="phase-label">{phase}</span>
            {isActive && <span className="seconds-count">{secondsLeft}s</span>}
          </div>
        </div>
      </div>

      <div className="breathing-actions">
        <button
          onClick={handleToggle}
          className={`breathe-toggle-btn ${isActive ? 'active' : ''}`}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          <span>{isActive ? 'Pause' : phase === 'Paused' ? 'Resume' : 'Begin Breathing'}</span>
        </button>
        {(phase !== 'Ready' || cyclesCompleted > 0) && (
          <button onClick={handleReset} className="breathe-reset-btn" title="Reset">
            <RotateCcw size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default BreathingWidget;
