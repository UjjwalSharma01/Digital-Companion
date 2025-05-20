'use client';

/**
 * Chat header with title and status
 * @param {Object} props - Component props
 * @param {string} props.title - Chat title
 * @param {string} props.status - Online status text
 */
export default function ChatHeader({ title = "Meri Digital Saheli 💬", status = "Online" }) {
  return (
    <div className="chat-header">
      <h2>{title}</h2>
      <div className="status">{status}</div>
    </div>
  );
}
