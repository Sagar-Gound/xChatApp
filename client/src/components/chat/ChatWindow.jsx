import React, { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import MessageInput from "./MessageInput.jsx";

const ChatWindow = () => {
  const { user } = useAuth();
  const { activeRoom, messages, isOtherTyping } = useChat();
  const messagesEndRef = useRef(null);

  const getOtherUser = () => {
    if (!activeRoom?.users) return null;
    return activeRoom.users.find((u) => u._id !== user?._id) || activeRoom.users[0];
  };

  const otherUser = getOtherUser();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  return (
    <div
      id="chat-window"
      className="d-flex flex-column h-100 flex-grow-1 bg-light"
      style={{ minWidth: 0 }}
    >
      {/* Active Chat Header */}
      <div className="d-flex align-items-center justify-content-between p-3 bg-white border-bottom shadow-sm">
        <div className="d-flex align-items-center overflow-hidden">
          <div
            className="rounded-circle d-flex justify-content-center align-items-center text-white me-3 flex-shrink-0"
            style={{
              width: "42px",
              height: "42px",
              backgroundColor: "#c084fc",
              fontWeight: 600,
            }}
          >
            {getInitials(otherUser?.fullName)}
          </div>
          <div className="overflow-hidden">
            <h6 className="mb-0 fw-semibold text-truncate text-dark">
              {otherUser?.fullName || "User"}
            </h6>
            {isOtherTyping ? (
              <span
                id="typing-indicator"
                className="text-primary small"
                style={{ fontSize: "12px" }}
              >
                typing...
              </span>
            ) : (
              <span className="text-muted small" style={{ fontSize: "12px" }}>
                Last seen 5 min ago
              </span>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-link text-muted p-0 fs-5 text-decoration-none"
            title="Options"
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-grow-1 p-3 overflow-auto"
        style={{
          backgroundColor: "#f4f4f5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 text-center py-5">
            <div
              className="card border-0 shadow-sm p-4 p-md-5 text-center"
              style={{ maxWidth: "380px", borderRadius: "16px" }}
            >
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 mx-auto"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#e0f2fe",
                  color: "#0284c7",
                }}
              >
                <i className="bi bi-chat-dots fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1 text-dark">No messages yet</h5>
              <p className="text-muted small mb-0">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === user?._id;
              return (
                <div
                  key={msg.timestamp || index}
                  className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"
                    }`}
                >
                  <div
                    className={`p-3 rounded-4 shadow-sm text-break ${isMe
                        ? "bg-primary text-white"
                        : "bg-white text-dark border"
                      }`}
                    style={{
                      maxWidth: "75%",
                      borderBottomRightRadius: isMe ? "4px" : "16px",
                      borderBottomLeftRadius: !isMe ? "4px" : "16px",
                    }}
                  >
                    <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                      {msg.content}
                    </div>
                    <div
                      className={`text-end extra-small mt-1 ${isMe ? "text-white-50" : "text-muted"
                        }`}
                      style={{ fontSize: "10px" }}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Bar */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;

