import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Jarvis online. I'm listening.",
  model: "local",
  timestamp: new Date().toISOString(),
};

export default function ChatWindow({ memory }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto start listening when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      startListening();
    }, 1000);
    return () => {
      clearTimeout(timer);
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();

    const clean = text.replace(/[*_#`]/g, "").replace(/ACTION:\w+:\S+/g, "").trim();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Google UK English Male") ||
        v.name.includes("Microsoft David") ||
        v.name.includes("Daniel")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        shouldRestartRef.current = true;
        setTimeout(() => startListening(), 500);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Wait for voices to load if not ready
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => doSpeak();
    } else {
      doSpeak();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (speaking) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setListening(false);
        setInput(transcript);
        setTimeout(() => sendMessage(transcript), 200);
      };

      recognition.onend = () => {
        setListening(false);
        // Auto restart listening if not speaking and not loading
        if (shouldRestartRef.current) {
          setTimeout(() => startListening(), 300);
        }
      };

      recognition.onerror = (e) => {
        setListening(false);
        if (e.error === "no-speech" && shouldRestartRef.current) {
          setTimeout(() => startListening(), 500);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Recognition error:", e);
    }
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    shouldRestartRef.current = false;
    recognitionRef.current?.stop();

    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, memory }),
      });

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.response,
        model: data.model_used,
        modelName: data.model_name,
        actionTaken: data.action_taken,
        actionResult: data.action_result,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speak(data.response);

    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "⚠️ Cannot reach backend.",
        timestamp: new Date().toISOString(),
      }]);
      shouldRestartRef.current = true;
      setTimeout(() => startListening(), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([WELCOME_MESSAGE]);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    shouldRestartRef.current = true;
    setTimeout(() => startListening(), 300);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <span className="jarvis-dot" />
          JARVIS
          {speaking && (
            <span className="speaking-badge">🔊 Speaking</span>
          )}
          {listening && !speaking && (
            <span className="listening-badge">🎤 Listening</span>
          )}
          {loading && (
            <span className="thinking-badge">⚙️ Thinking</span>
          )}
        </div>
        <div className="header-actions">
          {speaking && (
            <button className="stop-btn" onClick={stopSpeaking}>
              ⏹ Stop
            </button>
          )}
          <button className="clear-btn" onClick={clearChat}>Clear</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Speak or type here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}