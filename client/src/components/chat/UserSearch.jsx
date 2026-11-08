import React, { useState, useEffect } from "react";
import { api, useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";

const UserSearch = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();
  const { initChatWithUser } = useChat();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(
          `/api/users/search?searchTerm=${encodeURIComponent(searchTerm.trim())}`
        );
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setResults(res.data.data);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm, user?._id]);

  const handleSelectUser = async (otherUser) => {
    await initChatWithUser(otherUser._id);
    onClose();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      id="user-search-modal"
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
      }}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden"
        style={{ width: "90%", maxWidth: "460px", borderRadius: "12px" }}
      >
        <div
          className="d-flex justify-content-between align-items-center px-3 py-3"
          style={{ backgroundColor: "#1d4ed8", color: "#ffffff" }}
        >
          <h5 className="mb-0 fw-semibold fs-6">Find People to Chat</h5>
          <button
            id="close-search"
            type="button"
            className="btn btn-link text-white p-0 text-decoration-none"
            onClick={onClose}
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <div className="p-3">
          <div className="input-group mb-3">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              id="search-input"
              type="text"
              autoFocus
              className="form-control border-start-0"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            id="search-results-list"
            className="overflow-auto"
            style={{ maxHeight: "280px" }}
          >
            {searching && (
              <div className="text-center py-3 text-muted small">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
                Searching...
              </div>
            )}

            {!searching && results.length === 0 && searchTerm.trim() && (
              <div className="text-center py-3 text-muted small">
                No users found
              </div>
            )}

            {!searching &&
              results.map((u) => (
                <div
                  key={u._id}
                  id={`user-result-${u._id}`}
                  className="d-flex align-items-center p-2 rounded mb-2 cursor-pointer search-result-item"
                  style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                  onClick={() => handleSelectUser(u)}
                >
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center text-white me-3 flex-shrink-0"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#c084fc",
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(u.fullName)}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-semibold text-truncate text-dark">
                      {u.fullName}
                    </div>
                    <div className="text-muted small text-truncate">
                      @{u.username}
                    </div>
                    <div className="text-muted extra-small text-truncate" style={{ fontSize: "11px" }}>
                      {u.email}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;

