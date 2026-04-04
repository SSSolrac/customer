import { useState } from "react";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onLogin, onGuest }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onLogin({ fullName, email, password, role, isSignup });
      onClose();
    } catch (submitError) {
      setError(submitError?.message || "Login failed.");
    }
  };

  const handleGuestClick = () => {
    onGuest();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>{isSignup ? "Create Account" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isSignup ? <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required /> : null}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">owner</option>
            <option value="staff">staff</option>
            <option value="customer">customer</option>
          </select>

          <button type="submit" className="login-btn">{isSignup ? "Create Account" : "Login"}</button>
        </form>

        {error ? <p style={{ color: "#a11", marginTop: 8 }}>{error}</p> : null}

        <button className="guest-btn" onClick={handleGuestClick}>Continue as Guest</button>
        <p style={{ fontSize: ".8rem", color: "#666" }}>Demo: owner@happytails.local / owner123, staff@happytails.local / staff123</p>

        <p className="signup-text">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span style={{ color: "#ff6fa5", fontWeight: "bold", cursor: "pointer" }} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
