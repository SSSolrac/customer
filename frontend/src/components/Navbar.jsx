import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import profileIcon from "../assets/profile.png";
import "./Navbar.css";
import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";

function Navbar({ onSignOut, onOpenModal }) {
  const { cartCount } = useCart();
  const { isAuthenticated, isGuest, user } = useSession();

  return (
    <nav className="navbar" style={{ backgroundColor: "#ffffff" }}>
      <div className="nav-left">
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logo} alt="Logo" className="nav-logo" />
          <span className="logo-text" style={{ marginLeft: "10px", fontSize: "1.5rem", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "#ff4d94" }}>Happy</span>
            <span style={{ color: "#36d7e8" }}>Tails</span>
          </span>
        </Link>
      </div>

      <ul className="nav-center" style={{ marginLeft: "auto", marginRight: "40px" }}>
        <li><Link to="/" style={{ color: "#000000" }}>Home</Link></li>
        <li><Link to="/menu" style={{ color: "#000000" }}>Café Menu</Link></li>
        <li><Link to="/about" style={{ color: "#000000" }}>About Us</Link></li>
        {isAuthenticated ? <li><Link to="/order-history" style={{ color: "#000000" }}>My Orders</Link></li> : null}
      </ul>

      <div className="nav-right">
        <Link to="/cart" className="cart-link" aria-label="Basket">
          <span className="basket-icon">🧺</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="profile-link">
              <img src={profileIcon} alt="Profile" className="profile-icon" style={{ filter: "brightness(0)" }} />
            </Link>
            <button className="auth-btn" onClick={onSignOut} style={{ color: "#000000" }}>Sign Out</button>
          </>
        ) : isGuest ? (
          <>
            <span style={{ fontSize: ".85rem", color: "#444" }}>Browsing as {user?.fullName || "Guest"}</span>
            <button className="auth-btn" onClick={onSignOut} style={{ color: "#000000" }}>Sign In</button>
          </>
        ) : (
          <button className="auth-btn" onClick={onOpenModal} style={{ color: "#000000" }}>Sign Up / Login</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
