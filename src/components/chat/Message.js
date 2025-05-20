'use client';

/**
 * Individual chat message component
 * @param {Object} props - Component props
 * @param {string} props.content - Message text content
 * @param {boolean} props.isUser - Whether the message is from the user
 * @param {string} props.timestamp - Time the message was sent
 * @param {string|null} props.emojiReaction - Optional emoji reaction for AI messages
 */
export default function Message({ content, isUser, timestamp, emojiReaction }) {
  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      {content}
      
      {/* Timestamp */}
      <div className="time-stamp">
        {timestamp}
      </div>
      
      {/* Emoji reaction for AI messages */}
      {emojiReaction && (
        <div className="emoji-reaction">
          {emojiReaction}
        </div>
      )}
    </div>
  );
}
