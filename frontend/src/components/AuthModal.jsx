import { useState } from "react";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onLogin, onGuest }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ fullName, email });
    onClose();
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
          <input type="password" placeholder="Password" required />

          <button type="submit" className="login-btn">{isSignup ? "Create Account" : "Login"}</button>
        </form>

        <button className="guest-btn" onClick={handleGuestClick}>Continue as Guest</button>

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
