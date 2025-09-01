import React, { useState, useEffect, useRef } from "react";
import { axiosInstance as axios } from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ChatWithAI = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Fetch conversation history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/chat/history");
        if (res.data?.messages) {
          // Map backend -> frontend format
          const mapped = res.data.messages.map((m) => ({
            sender: m.role, // "user" | "assistant"
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12:true,
            }),
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const now = new Date();
    const userMessage = {
      sender: "user",
      text: input,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit",hour12: true}),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("/api/chat", {
        message: input,
      });

      const assistantMessage = {
        sender: "assistant",
        text: res.data.answer || "I don't know — please contact support.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Error: unable to fetch response.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4 md:py-8">
      <div className="w-full max-w-4xl mx-auto h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6">
          <button
            onClick={() => navigate(-1)}  // ✅ go back to last URL
            className="mr-3 p-2 rounded-full hover:bg-white/20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex-1 text-center">
            Chat with AI Assistant
          </h1>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-1">
                Type a message below to begin chatting with the AI assistant
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-4"
                    : "bg-white text-slate-800 mr-4 border border-slate-200"
                }`}
              >
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Container */}
        <div className="border-t border-slate-200 bg-white p-4 md:p-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 md:py-4 pr-4 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="1"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;
