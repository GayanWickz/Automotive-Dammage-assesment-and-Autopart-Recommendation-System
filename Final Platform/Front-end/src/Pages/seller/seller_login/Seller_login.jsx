import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./seller_login.css";

const Seller_login = () => {
  const [formData, setFormData] = useState({
    SellerEmail: "",
    SellerPassword: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.SellerEmail.trim()) {
      newErrors.SellerEmail = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.SellerEmail)
    ) {
      newErrors.SellerEmail = "Invalid email address.";
    }
    if (!formData.SellerPassword.trim()) {
      newErrors.SellerPassword = "Password is required.";
    } else if (formData.SellerPassword.length < 6) {
      newErrors.SellerPassword = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError("");

    try {
      const response = await axios.post(
        "/api/sellerauthentication/sellerlogin",
        formData
      );

      if (response.data.success) {
        localStorage.setItem("sellertoken", response.data.token);
        localStorage.setItem("sellerId", response.data.sellerId);
        console.log("Login successful:", response.data);
        alert("Welcome back!");
        navigate("/Seller_home");
      } else {
        setApiError(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error(
        "Error during login:",
        error.response ? error.response.data.message : error.message
      );
      setApiError(
        error.response
          ? error.response.data.message
          : "An error occurred. Please try again later."
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(forgotPasswordEmail)) {
      setErrors({ forgotPasswordEmail: "Valid email is required." });
      return;
    }

    try {
      const response = await axios.post(
        "/api/sellerauthentication/forgot-password",
        { SellerEmail: forgotPasswordEmail }
      );

      if (response.data.success) {
        setForgotPasswordMessage("A password reset link has been sent to your email.");
        setErrors({});
      } else {
        setErrors({ forgotPasswordEmail: response.data.message || "Failed to send reset email." });
      }
    } catch (error) {
      console.error("Error during forgot password:", error);
      setErrors({ forgotPasswordEmail: error.response?.data?.message || "Failed to send reset email." });
    }
  };

  return (
    <div className="seller-login-main">
      <div className="seller-login-con">
        <h3 className="text-hili">Seller Login</h3>
        <p>Welcome back! Log in to access all our services.</p>
        {!showForgotPassword ? (
          <>
            <form className="gap" onSubmit={handleSubmit}>
              <div className="login-input-box">
                <input
                  type="text"
                  name="SellerEmail"
                  placeholder="Company email"
                  value={formData.SellerEmail}
                  onChange={handleChange}
                />
                {errors.SellerEmail && (
                  <p className="error">{errors.SellerEmail}</p>
                )}
              </div>
              <div className="login-input-box">
                <input
                  type="password"
                  name="SellerPassword"
                  placeholder="Password"
                  value={formData.SellerPassword}
                  onChange={handleChange}
                />
                {errors.SellerPassword && (
                  <p className="error">{errors.SellerPassword}</p>
                )}
              </div>
              {apiError && <p className="error">{apiError}</p>}
              <button className="login-button" type="submit">
                Login
              </button>
            </form>
            <p
              className="gap back-to-login"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </p>
            <Link to="/Seller_signup">
              <p className="gap">Don't have an account? Sign up</p>
            </Link>
          </>
        ) : (
          <div className="forgot-password-form">
            <h3 className="text-hili">Reset Password</h3>
            <p>Enter your email to receive a password reset link.</p>
            <form className="gap" onSubmit={handleForgotPassword}>
              <div className="login-input-box">
                <input
                  type="email"
                  placeholder="Company email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                {errors.forgotPasswordEmail && (
                  <p className="error">{errors.forgotPasswordEmail}</p>
                )}
              </div>
              {forgotPasswordMessage && (
                <p style={{ color: "green" }}>{forgotPasswordMessage}</p>
              )}
              <button className="login-button">Send Reset Link</button>
            </form>
            <p
              className="gap back-to-login"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seller_login;