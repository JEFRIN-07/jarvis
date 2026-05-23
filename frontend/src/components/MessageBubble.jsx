export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      {!isUser && (
        <div className="avatar jarvis-avatar">J</div>
      )}

      <div className={`bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        <div className="bubble-content">{message.content}</div>

        {message.actionTaken && (
          <div className="action-tag">
            ⚡ {message.actionTaken.replace("_", " ").toLowerCase()}
            {message.actionResult && (
              <span className="action-result"> — {message.actionResult}</span>
            )}
          </div>
        )}

        <div className="bubble-meta">
          {!isUser && message.modelName && (
            <span className={`model-badge ${message.model === "local" ? "local" : "cloud"}`}>
              {message.model === "local" ? "🖥 local" : "☁ cloud"}
            </span>
          )}
          <span className="timestamp">{time}</span>
        </div>
      </div>

      {isUser && (
        <div className="avatar user-avatar">You</div>
      )}
    </div>
  );
}
