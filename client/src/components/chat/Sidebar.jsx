import React from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";

const Sidebar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { rooms, activeRoom, selectRoom } = useChat();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getOtherUser = (room) => {
    if (!room?.users) return null;
    return room.users.find((u) => u._id !== user?._id) || room.users[0];
  };

  return (
    <div
      className="d-flex flex-column h-100 bg-white border-end"
      style={{ width: "340px", flexShrink: 0 }}
    >
      {/* Top User Info Bar */}
      <div
        className="d-flex align-items-center justify-content-between p-3 text-white"
        style={{ backgroundColor: "#70529d" }}
      >
        <div className="d-flex align-items-center overflow-hidden">
          <div className="position-relative me-3 flex-shrink-0">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: "#a855f7",
                fontSize: "15px",
              }}
            >
              {getInitials(user?.fullName)}
            </div>
            <span
              className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
              style={{ width: "10px", height: "10px" }}
            ></span>
          </div>

          <div className="overflow-hidden">
            <div
              id="user-name"
              className="fw-bold text-truncate"
              style={{ fontSize: "15px" }}
            >
              {user?.fullName}
            </div>
            <div
              id="user-username"
              className="text-white-50 small text-truncate"
              style={{ fontSize: "13px" }}
            >
              @{user?.username}
            </div>
          </div>
        </div>

        <button
          id="logout-button"
          type="button"
          title="Logout"
          className="btn btn-link text-white p-0 fs-5 ms-2"
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          id="new-chat-button"
          type="button"
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center py-2 fw-semibold"
          style={{ backgroundColor: "#1d4ed8", borderColor: "#1d4ed8", borderRadius: "8px" }}
          onClick={onOpenSearch}
        >
          <i className="bi bi-plus-circle me-2"></i>
          New Chat
        </button>
      </div>

      {/* Recent Chats Section */}
      <div className="px-3 py-1">
        <span
          className="text-uppercase text-muted fw-bold"
          style={{ fontSize: "11px", letterSpacing: "0.5px" }}
        >
          Recent Chats
        </span>
      </div>

      {/* Rooms List Container */}
      <div
        id="chat-rooms-list"
        className="flex-grow-1 overflow-auto px-2"
      >
        {rooms.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div className="mb-3">
              <i className="bi bi-chat-dots fs-1 text-secondary opacity-50"></i>
            </div>
            <div className="fw-semibold text-dark mb-1">
              No conversations yet
            </div>
            <div className="small text-muted">
              Search for users to start chatting
            </div>
          </div>
        ) : (
          rooms.map((room) => {
            const otherUser = getOtherUser(room);
            const isActive = activeRoom?._id === room._id;
            return (
              <button
                key={room._id}
                id={`room-${room._id}`}
                type="button"
                className={`btn w-100 text-start d-flex align-items-center p-2 mb-1 border-0 rounded ${isActive ? "bg-primary-subtle text-primary" : "btn-light"
                  }`}
                style={{
                  transition: "background-color 0.15s ease",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                }}
                onClick={() => selectRoom(room)}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center text-white me-3 flex-shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#c084fc",
                    fontWeight: 600,
                  }}
                >
                  {getInitials(otherUser?.fullName)}
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      className={`fw-semibold text-truncate ${isActive ? "text-primary" : "text-dark"
                        }`}
                    >
                      {otherUser?.fullName || "User"}
                    </span>
                  </div>
                  <div className="text-muted small text-truncate" style={{ fontSize: "12px" }}>
                    Last seen recently
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;

