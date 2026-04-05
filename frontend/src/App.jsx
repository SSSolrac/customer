import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Order from "./pages/Order";
import OrderCategory from "./pages/OrderCategory";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import Notifications from "./pages/Notifications";
import pattern from "./assets/pattern.png";
import { useSession } from "./context/SessionContext";
import { createLoginHistory, login as loginRequest, logout as logoutRequest, signup as signupRequest } from "./services/authService";
import { getApiBaseUrl, isApiAvailableError } from "./services/api";

function ProtectedRoute({ children }) {
  const { canAccessAccount } = useSession();
  return canAccessAccount ? children : <Navigate to="/" replace />;
}

function App() {
  const { isAuthenticated, isGuest, signIn, continueAsGuest, signOut } = useSession();
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLanding = location.pathname === "/";

    if (!isLanding) {
      document.body.style.backgroundColor = "#f2f2f2";
      document.body.style.backgroundImage = `url(${pattern})`;
      document.body.style.backgroundRepeat = "repeat";
      document.body.style.backgroundSize = "520px";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.backgroundImage = "none";
    }

    return () => {
      document.body.style.backgroundImage = "none";
    };
  }, [location.pathname]);

  const handleLogin = async (credentials) => {
    let user = null;

    try {
      user = credentials.isSignup
        ? await signupRequest({ fullName: credentials.fullName, email: credentials.email, password: credentials.password, role: credentials.role })
        : await loginRequest({ email: credentials.email, password: credentials.password, role: credentials.role });
    } catch (error) {
      if (isApiAvailableError(error)) {
        throw new Error(`Unable to reach the backend API at ${getApiBaseUrl()}. Start the server in customer/backend and try again.`);
      }
      throw error;
    }

    if (!user) throw new Error(credentials.isSignup ? "Unable to create account." : "Invalid credentials.");

    signIn({
      id: user.id,
      email: user.email,
      fullName: user.name || credentials.fullName,
      role: user.role,
      customerCode: user.customerCode
    });

    try {
      await createLoginHistory({ id: user.id, name: user.name, email: user.email, role: user.role, loginStatus: "success" });
    } catch {
      // best effort API logging
    }
    setShowModal(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    setShowModal(false);
    navigate("/order");
  };

  const handleSignOut = async () => {
    try {
      if (isAuthenticated) await logoutRequest({ loginStatus: "logout" });
    } catch {
      // best effort API logging
    }
    signOut();
    navigate("/");
  };

  const handleOrderClick = () => {
    if (!isAuthenticated && !isGuest) setShowModal(true);
    else navigate("/order");
  };

  return (
    <div className="app-shell">
      <Navbar onSignOut={handleSignOut} onOpenModal={() => setShowModal(true)} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home onOrderClick={handleOrderClick} />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order/:category" element={<OrderCategory />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLogin={handleLogin}
        onGuest={handleGuest}
      />
    </div>
  );
}

export default App;
