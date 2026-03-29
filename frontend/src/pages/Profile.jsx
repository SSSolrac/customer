import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoyaltyCard from "../components/loyalty/LoyaltyCard";
import { getCustomerLoyaltyData } from "../services/loyaltyService";
import { getCustomerProfile, saveCustomerProfile } from "../services/profileService";
import "./Profile.css";

const blankProfile = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: ""
};

function Profile() {
  const [formData, setFormData] = useState(blankProfile);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getCustomerProfile();
      if (profile) setFormData((prev) => ({ ...prev, ...profile }));
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadLoyaltyData = async () => {
      // TODO(API): replace mock call with GET /api/loyalty/me.
      const data = await getCustomerLoyaltyData();
      setLoyaltyData(data);
    };

    loadLoyaltyData();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors((prev) => ({ ...prev, [event.target.name]: "" }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Name is required.";
    if (!formData.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    await saveCustomerProfile(formData);
    setMessage("Profile saved. Checkout will auto-fill these details.");
    setIsSaving(false);
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {loyaltyData ? <LoyaltyCard loyaltyData={loyaltyData} /> : <p className="loyalty-loading">Loading loyalty card...</p>}

      <div className="profile-links">
        <Link to="/order-history">View order history</Link>
        <Link to="/track-order">Track latest order</Link>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
        {errors.fullName ? <p className="field-error">{errors.fullName}</p> : null}

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}

        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
        {errors.phone ? <p className="field-error">{errors.phone}</p> : null}

        <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />

        <textarea name="notes" placeholder="Delivery Notes (optional)" value={formData.notes} onChange={handleChange} />

        <button type="submit" className="save-btn" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Information"}
        </button>

        {message ? <p className="profile-message">{message}</p> : null}
      </form>
    </div>
  );
}

export default Profile;
