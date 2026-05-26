import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function getGreeting() {
  const hour = new Date().getHours();
  const greetings = {
    morning: [
      "Good morning, sir! Systems online. Ready to assist you today.",
      "Good morning! All systems operational. What shall we tackle today?",
      "Rise and shine, sir! Jarvis is online and at your service.",
    ],
    afternoon: [
      "Good afternoon, sir! Hope your day is going well. How can I assist?",
      "Good afternoon! Jarvis online. What do you need?",
      "Afternoon, sir! Ready and waiting for your commands.",
    ],
    evening: [
      "Good evening, sir! Long day? I'm here to help.",
      "Good evening! Jarvis at your service. What can I do for you?",
      "Evening, sir! Systems fully operational. How may I assist?",
    ],
    night: [
      "Working late, sir? I'm here with you. What do you need?",
      "Good night, sir! Still at it? Let's get things done.",
      "Night mode activated, sir. How can I help you?",
    ],
  };

  let list;
  if (hour >= 5 && hour < 12) list = greetings.morning;
  else if (hour >= 12 && hour < 17) list = greetings.afternoon;
  else if (hour >= 17 && hour < 21) list = greetings.evening;
  else list = greetings.night;

  return list[Math.floor(Math.random() * list.length)];
}

const WELCOME_TEXT = getGreeting();

const WELCOME_MESSAGE = {
  role: "assistant",
  content: WELCOME_TEXT,
  model: "local",
  timestamp: new Date().toISOString(),
};

export default function ChatWindow({ memory }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listeningPaused, setListeningPaused] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(WELCOME_TEXT, true);
    }, 1000);
    return () => {
      clearTimeout(timer);
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const speak = (text, autoListen = false) => {
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
        if (!listeningPaused) {
          shouldRestartRef.current = true;
          setTimeout(() => startListening(), 500);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => doSpeak();
    } else {
      doSpeak();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || speaking || listeningPaused) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setListening(false);

        // Stop listening commands
        if (
          transcript.includes("stop listening") ||
          transcript.includes("jarvis stop") ||
          transcript.includes("pause jarvis") ||
          transcript.includes("be quiet")
        ) {
          shouldRestartRef.current = false;
          setListeningPaused(true);
          recognitionRef.current?.stop();
          const msg = {
            role: "assistant",
            content: "Listening paused. Say 'start listening' or 'wake up Jarvis' to resume.",
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, msg]);
          speak("Listening paused sir. Say wake up Jarvis to resume.", false);
          return;
        }

        // Start listening commands
        if (
          transcript.includes("start listening") ||
          transcript.includes("wake up jarvis") ||
          transcript.includes("jarvis wake up") ||
          transcript.includes("resume listening")
        ) {
          setListeningPaused(false);
          shouldRestartRef.current = true;
          const msg = {
            role: "assistant",
            content: "I'm listening again, sir!",
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, msg]);
          speak("I'm listening again, sir!", true);
          return;
        }

        setInput(transcript);
        setTimeout(() => sendMessage(transcript), 200);
      };

      recognition.onend = () => {
        setListening(false);
        if (shouldRestartRef.current && !listeningPaused) {
          setTimeout(() => startListening(), 300);
        }
      };

      recognition.onerror = (e) => {
        setListening(false);
        if (e.error === "no-speech" && shouldRestartRef.current && !listeningPaused) {
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

    // Sleep commands — handle before sending to AI
    if (
      text.toLowerCase().includes("jarvis sleep") ||
      text.toLowerCase().includes("blackpearl sleep") ||
      text.toLowerCase().includes("goodbye jarvis") ||
      text.toLowerCase().includes("sleep jarvis")
    ) {
      const sleepMsg = {
        role: "assistant",
        content: "Goodbye sir! Going to sleep. Say Hello Jarvis to wake me up!",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sleepMsg]);
      speak("Goodbye sir! Going to sleep. Say Hello Jarvis to wake me up!");
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      setListeningPaused(true);
      setInput("");
      // Close window after 3 seconds
      setTimeout(() => {
        window.close();
      }, 4000);
      return;
    }

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
    if (!listeningPaused) {
      shouldRestartRef.current = true;
      setTimeout(() => startListening(), 300);
    }
  };

  const toggleListening = () => {
    if (listeningPaused) {
      setListeningPaused(false);
      shouldRestartRef.current = true;
      setTimeout(() => startListening(), 300);
    } else {
      setListeningPaused(true);
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <span className="jarvis-dot" />
          JARVIS
          {speaking && <span className="speaking-badge">🔊 Speaking</span>}
          {listening && !speaking && <span className="listening-badge">🎤 Listening</span>}
          {listeningPaused && <span className="paused-badge">⏸ Sleeping</span>}
          {loading && <span className="thinking-badge">⚙️ Thinking</span>}
        </div>
        <div className="header-actions">
          {speaking && (
            <button className="stop-btn" onClick={stopSpeaking}>⏹ Stop</button>
          )}
          <button
            className={`pause-btn ${listeningPaused ? "paused" : ""}`}
            onClick={toggleListening}
          >
            {listeningPaused ? "▶ Wake Up" : "⏸ Sleep"}
          </button>
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