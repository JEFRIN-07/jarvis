export default function StatusBar({ isOnline, memory }) {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="jarvis-logo">⬡ JARVIS</span>
        <span className="version">v0.1</span>
      </div>
      <div className="status-right">
        {memory?.name && (
          <span className="status-user">👤 {memory.name}</span>
        )}
        <span className={`status-dot ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "● Online" : "● Offline"}
        </span>
      </div>
    </div>
  );
}
