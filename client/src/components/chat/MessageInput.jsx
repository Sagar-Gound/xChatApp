import React, { useState, useRef } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";

const MessageInput = () => {
  const [text, setText] = useState("");
  const { sendNewMessage, handleTyping } = useChat();
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    sendNewMessage(text);
    setText("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    handleTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="d-flex align-items-center p-3 bg-white border-top gap-2"
    >
      <button
        type="button"
        className="btn btn-link text-muted p-0 fs-5 text-decoration-none me-1"
        title="Emoji"
      >
        <i className="bi bi-emoji-smile"></i>
      </button>

      <input
        id="message-input"
        type="text"
        autoComplete="off"
        className="form-control rounded-pill border py-2 px-3"
        placeholder="Type your message..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      <button
        id="send-button"
        type="submit"
        disabled={!text.trim()}
        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
          backgroundColor: "#3b82f6",
          borderColor: "#3b82f6",
        }}
      >
        <i className="bi bi-send-fill fs-6"></i>
      </button>
    </form>
  );
};

export default MessageInput;

