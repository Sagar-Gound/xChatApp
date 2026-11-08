import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await register(fullName, username, email, password);
      if (res?.success) {
        navigate("/login");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong while registering the user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="register-page"
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
    >
      <div
        className="card border-0 shadow-sm p-4 p-md-5"
        style={{ width: "100%", maxWidth: "440px", borderRadius: "16px" }}
      >
        <div className="text-center mb-4">
          <div
            className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
            }}
          >
            <i className="bi bi-chat-dots-fill fs-4"></i>
          </div>
          <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
            Create Account
          </h2>
          <p className="text-muted small">
            Join our community and start chatting
          </p>
        </div>

        {error && (
          <div
            id="register-error"
            className="alert alert-danger py-2 small mb-3"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Full Name
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                id="fullname-input"
                type="text"
                required
                className="form-control border-start-0"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Email address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                id="email-input"
                type="email"
                required
                className="form-control border-start-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Username
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-at"></i>
              </span>
              <input
                id="username-input"
                type="text"
                required
                className="form-control border-start-0"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                id="password-input"
                type="password"
                required
                className="form-control border-start-0"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            id="register-button"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-semibold"
            style={{ backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary text-decoration-none fw-semibold"
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;

