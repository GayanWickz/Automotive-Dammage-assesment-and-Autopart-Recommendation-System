import axios from "axios";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Seller_login.css";

const SellerResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("");

    try {
      const response = await axios.post(
        "https://192.168.137.1:3000/api/sellerauthentication/reset-password",
        { token, newPassword }
      );

      if (response.data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/Seller_login"), 3000);
      } else {
        setErrors({ newPassword: response.data.message || "Failed to reset password." });
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setErrors({ newPassword: error.response?.data?.message || "Failed to reset password." });
    }
  };

  return (
    <div className="login-main">
      <div className="login-con">
        <h3 className="text-hili">Reset Password</h3>
        <p>Enter your new password below.</p>
        <form className="gap" onSubmit={handleSubmit}>
          <div className="login-input-box">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {errors.newPassword && <p className="error">{errors.newPassword}</p>}
          </div>
          {message && <p style={{ color: "green" }}>{message}</p>}
          <button className="login-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default SellerResetPassword;