import React, { useState } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import UserSearch from "./UserSearch.jsx";

const ChatLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { activeRoom } = useChat();

  return (
    <div
      id="chat-layout"
      className="d-flex vh-100 overflow-hidden bg-white"
    >
      {/* Sidebar with Rooms and Profile */}
      <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Chat Area */}
      {activeRoom ? (
        <ChatWindow />
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 bg-light text-center p-4">
          <div
            className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3"
            style={{
              width: "72px",
              height: "72px",
              backgroundColor: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <i className="bi bi-chat-dots fs-1"></i>
          </div>
          <h4 className="fw-bold mb-2 text-dark">No chat selected</h4>
          <p
            className="text-muted small mb-0"
            style={{ maxWidth: "340px", lineHeight: "1.5" }}
          >
            Select a conversation from the sidebar or start a new chat to begin
            messaging
          </p>
        </div>
      )}

      {/* User Search Modal */}
      {isSearchOpen && <UserSearch onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
};

export default ChatLayout;

