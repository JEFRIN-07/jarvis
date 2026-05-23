import { useState } from "react";

export default function Sidebar({ memory, updateMemory }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (key) => {
    setEditing(key);
    setEditVal(memory[key] || "");
  };

  const saveEdit = () => {
    if (editing) {
      updateMemory(editing, editVal);
      setEditing(null);
    }
  };

  const QUICK_COMMANDS = [
    { label: "Open Chrome", msg: "Open Chrome" },
    { label: "Open VS Code", msg: "Open VS Code" },
    { label: "Search AI news", msg: "Search AI news today" },
    { label: "Help me code", msg: "Help me write a Python script" },
    { label: "Open YouTube", msg: "Open https://youtube.com" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">🧠 Memory</div>

        {["name", "preferences", "projects"].map((key) => (
          <div key={key} className="memory-item">
            <div className="memory-key">{key}</div>
            {editing === key ? (
              <div className="memory-edit">
                <input
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                />
                <button onClick={saveEdit}>✓</button>
              </div>
            ) : (
              <div className="memory-value" onClick={() => startEdit(key)}>
                {memory[key] || <span className="empty">click to set</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">⚡ Quick Commands</div>
        <div className="quick-commands">
          {QUICK_COMMANDS.map((cmd, i) => (
            <button
              key={i}
              className="quick-cmd-btn"
              onClick={() => {
                // Dispatch a custom event to trigger chat
                window.dispatchEvent(
                  new CustomEvent("jarvis:quick", { detail: cmd.msg })
                );
              }}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">📝 Notes</div>
        <div className="notes-list">
          {(memory.notes || []).length === 0 ? (
            <div className="empty">No notes yet</div>
          ) : (
            (memory.notes || []).map((note, i) => (
              <div key={i} className="note-item">• {note}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
