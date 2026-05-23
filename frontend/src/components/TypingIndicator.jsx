export default function TypingIndicator() {
  return (
    <div className="message-row assistant-row">
      <div className="avatar jarvis-avatar">J</div>
      <div className="bubble assistant-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
