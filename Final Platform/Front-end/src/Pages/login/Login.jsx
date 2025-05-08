import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    CustomerEmail: "",
    CustomerPassword: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.CustomerEmail.trim()) {
      newErrors.CustomerEmail = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.CustomerEmail)
    ) {
      newErrors.CustomerEmail = "Invalid email address.";
    }
    if (!formData.CustomerPassword.trim()) {
      newErrors.CustomerPassword = "Password is required.";
    } else if (formData.CustomerPassword.length < 6) {
      newErrors.CustomerPassword = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        "https://192.168.137.1:3000/api/customerauthentication/customerlogin",
        formData
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("customerId", response.data.customerId);
        localStorage.setItem("customerEmail", response.data.customerEmail);
        console.log("Login successful");
        alert("Welcome back!");
        navigate("/");
      } else {
        setApiError(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setApiError(error.response?.data?.message || "Your email or password is incorrect!");
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google Sign-In logic
    alert("Google Sign-In not implemented yet.");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(forgotPasswordEmail)) {
      setErrors({ forgotPasswordEmail: "Valid email is required." });
      return;
    }

    try {
      const response = await axios.post(
        "https://192.168.137.1:3000/api/customerauthentication/forgot-password",
        { CustomerEmail: forgotPasswordEmail }
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
    <div className="login-main">
      <div className="login-con">
        <h3 className="text-hili">Customer Login</h3>
        <p>Welcome back! Log in to access all our services.</p>
        {!showForgotPassword ? (
          <>
            <form className="gap" onSubmit={handleSubmit}>
              <div className="login-input-box">
                <input
                  type="text"
                  name="CustomerEmail"
                  placeholder="User email"
                  value={formData.CustomerEmail}
                  onChange={handleChange}
                />
                {errors.CustomerEmail && (
                  <p className="error">{errors.CustomerEmail}</p>
                )}
              </div>
              <div className="login-input-box">
                <input
                  type="password"
                  name="CustomerPassword"
                  placeholder="Password"
                  value={formData.CustomerPassword}
                  onChange={handleChange}
                />
                {errors.CustomerPassword && (
                  <p className="error">{errors.CustomerPassword}</p>
                )}
              </div>
              {apiError && <p className="error">{apiError}</p>}
              <button className phương pháp="login-button">Login</button>
            </form>
            <button className="google-signin-button" onClick={handleGoogleSignIn}>
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google logo"
                className="google-logo"
              />
              Sign in with Google
            </button>
            <p
              className="gap back-to-login"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </p>
            <Link to="/Signup">
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
                  placeholder="User email"
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

export default Login;