import { useState, useEffect } from "react";
import LoyaltyCard from "../components/loyalty/LoyaltyCard";
import { getCustomerLoyaltyData } from "../services/loyaltyService";
import "./Profile.css";

function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: ""
  });
  const [loyaltyData, setLoyaltyData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem("userProfile");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    const loadLoyaltyData = async () => {
      // TODO (API integration): replace mock service with GET /api/loyalty/me.
      const data = await getCustomerLoyaltyData();
      setLoyaltyData(data);
    };

    loadLoyaltyData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("userProfile", JSON.stringify(formData));
    alert("Profile saved successfully!");
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {loyaltyData ? (
        <LoyaltyCard loyaltyData={loyaltyData} />
      ) : (
        <p className="loyalty-loading">Loading your loyalty card...</p>
      )}

      <form className="profile-form" onSubmit={handleSave}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Delivery Notes (optional)"
          value={formData.notes}
          onChange={handleChange}
        />

        <button type="submit" className="save-btn">
          Save Information
        </button>
      </form>
    </div>
  );
}

export default Profile;
