import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import "./App.css";

function App() {
  const [memory, setMemory] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Load memory on start
    fetch("http://localhost:8000/api/memory/")
      .then((r) => r.json())
      .then((data) => setMemory(data))
      .catch(() => {});

    // Check backend health
    fetch("http://localhost:8000/health")
      .then((r) => r.json())
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));
  }, []);

  const updateMemory = (key, value) => {
    fetch("http://localhost:8000/api/memory/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
      .then((r) => r.json())
      .then((data) => setMemory(data.memory));
  };

  return (
    <div className="app">
      <StatusBar isOnline={isOnline} memory={memory} />
      <div className="app-body">
        <Sidebar memory={memory} updateMemory={updateMemory} />
        <ChatWindow memory={memory} />
      </div>
    </div>
  );
}

export default App;
