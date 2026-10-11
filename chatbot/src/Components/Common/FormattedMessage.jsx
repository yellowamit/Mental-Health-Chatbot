import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './FormattedMessage.css';
import { Phone, HeartHandshake, ShieldAlert } from 'lucide-react';

// Detect crisis hotlines or emergency contacts to render highlighted action badges
const extractHotlines = (text) => {
  if (!text) return [];
  const hotlines = [];

  const patterns = [
    { name: '988 Suicide & Crisis Lifeline', number: '988', region: 'US / Canada' },
    { name: 'Crisis Text Line', number: '741741', action: 'sms:741741?body=HOME', textOnly: true, region: 'US / UK / CA' },
    { name: 'AASRA Helpline', number: '+919820466726', region: 'India (24/7)' },
    { name: 'Sneha India', number: '+914424640050', region: 'India (24/7)' },
    { name: 'Vandrevala Foundation', number: '+919999666555', region: 'India (24/7)' },
    { name: 'Kiran Mental Health Helpline', number: '18005990019', region: 'India (Toll-Free)' },
    { name: 'Tele-MANAS', number: '14416', region: 'India (24/7)' },
    { name: 'Emergency Services (India/EU)', number: '112', region: 'Immediate Emergency' }
  ];

  patterns.forEach(item => {
    // Check if number or name appears in text
    if (text.includes(item.number) || text.toLowerCase().includes(item.name.toLowerCase())) {
      hotlines.push(item);
    }
  });

  return hotlines;
};

function FormattedMessage({ content, isBot = true }) {
  if (!content) return null;

  const hotlines = isBot ? extractHotlines(content) : [];
  const hasEmergencyContext = hotlines.length > 0;

  return (
    <div className={`formatted-message ${isBot ? 'bot-formatted' : 'user-formatted'}`}>
      {hasEmergencyContext && (
        <div className="crisis-highlight-banner">
          <div className="crisis-highlight-header">
            <ShieldAlert size={18} className="crisis-icon" />
            <span>Immediate Support & Crisis Helplines</span>
          </div>
          <p className="crisis-note">If you or someone you care about is struggling, free and confidential support is available right now:</p>
          <div className="crisis-chips-grid">
            {hotlines.map((hl, i) => (
              <a
                key={i}
                href={hl.action ? hl.action : `tel:${hl.number}`}
                className="crisis-chip"
                title={`Call ${hl.name}`}
              >
                <Phone size={13} />
                <span className="crisis-chip-name">{hl.name}:</span>
                <span className="crisis-chip-num">{hl.number}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, children, ...props }) => <p className="md-p" {...props}>{children}</p>,
            ul: ({ node, children, ...props }) => <ul className="md-ul" {...props}>{children}</ul>,
            ol: ({ node, children, ...props }) => <ol className="md-ol" {...props}>{children}</ol>,
            li: ({ node, children, ...props }) => <li className="md-li" {...props}>{children}</li>,
            h1: ({ node, children, ...props }) => <h3 className="md-h1" {...props}>{children}</h3>,
            h2: ({ node, children, ...props }) => <h4 className="md-h2" {...props}>{children}</h4>,
            h3: ({ node, children, ...props }) => <h5 className="md-h3" {...props}>{children}</h5>,
            blockquote: ({ node, children, ...props }) => (
              <blockquote className="md-quote" {...props}>
                <HeartHandshake size={16} className="quote-icon" />
                <div>{children}</div>
              </blockquote>
            ),
            strong: ({ node, children, ...props }) => <strong className="md-strong" {...props}>{children}</strong>,
            em: ({ node, children, ...props }) => <em className="md-em" {...props}>{children}</em>,
            code: ({ node, inline, children, ...props }) => (
              inline ? <code className="md-code-inline" {...props}>{children}</code> : <code className="md-code-block" {...props}>{children}</code>
            ),
            a: ({ node, children, ...props }) => (
              <a
                className="md-link"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default FormattedMessage;
