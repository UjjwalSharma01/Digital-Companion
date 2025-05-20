'use client';

/**
 * Typing indicator to show when the AI is "thinking"
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the typing indicator should be visible
 */
export default function TypingIndicator({ isVisible }) {
  if (!isVisible) return null;
  
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
}
