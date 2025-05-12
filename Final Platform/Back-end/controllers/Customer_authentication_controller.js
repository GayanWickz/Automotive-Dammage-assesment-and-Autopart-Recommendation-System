import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import CustomerAuthenticationModel from "../models/Customer_authentication_platform.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import https from "https";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Customer login
const CustomerLogin = async (req, res) => {
  const { CustomerEmail, CustomerPassword } = req.body;

  // Validate input fields
  if (!CustomerEmail || !CustomerPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (!validator.isEmail(CustomerEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format.",
    });
  }

  try {
    const logexists = await CustomerAuthenticationModel.findOne({
      CustomerEmail,
    });

    if (!logexists) {
      return res.status(410).json({
        success: false,
        message: "Your email is not registered. Please register.",
      });
    }
    const isMatch = await bcryptjs.compare(
      CustomerPassword,
      logexists.CustomerPassword
    );

    if (!isMatch) {
      return res.status(410).json({
        success: false,
        message: "Your email or password is incorrect!",
      });
    }

    // Token
    const token = jwt.sign(
      { id: logexists._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    // Send customer ID
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      customerId: logexists._id,
      customerEmail: logexists.CustomerEmail,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

// Customer signup
const CustomerSignup = async (req, res) => {
  try {
    const {
      CustomerName,
      CustomerEmail,
      CustomerAddress,
      CustomerPhoneNumber,
      CustomerPassword,
    } = req.body;

    // Validate input fields
    if (
      !CustomerName ||
      !CustomerEmail ||
      !CustomerPassword ||
      !CustomerAddress ||
      !CustomerPhoneNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (!validator.isEmail(CustomerEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Check if the email is already registered
    const exists = await CustomerAuthenticationModel.findOne({ CustomerEmail });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(CustomerPassword, 10);

    // Create a new customer
    const newCustomer = new CustomerAuthenticationModel({
      CustomerName,
      CustomerEmail,
      CustomerAddress,
      CustomerPhoneNumber,
      CustomerPassword: hashedPassword,
    });

    const savedCustomer = await newCustomer.save();

    // Generate token for the new customer
    const token = jwt.sign(
      { id: savedCustomer._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "Signup successful!",
      customerId: savedCustomer._id,
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to signup.",
    });
  }
};

// Forgot Password
const ForgotPassword = async (req, res) => {
  const { CustomerEmail } = req.body;

  if (!CustomerEmail || !validator.isEmail(CustomerEmail)) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required.",
    });
  }

  try {
    const customer = await CustomerAuthenticationModel.findOne({ CustomerEmail });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpires = Date.now() + 3600000; // 1 hour expiry

    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = resetTokenExpires;
    await customer.save();

    // Send reset email using provided endpoint
    const resetUrl = `https://192.168.137.1:5173/reset-password/${resetToken}`;
    const emailPayload = {
      to: CustomerEmail,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\nThis link will expire in 1 hour.`,
    };

    // Disable SSL verification for development
    await axios.post("https://192.168.137.1:3000/api/email/send-email", emailPayload, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset email.",
    });
  }
};

// Reset Password
const ResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  try {
    const customer = await CustomerAuthenticationModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    customer.CustomerPassword = hashedPassword;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};

// Google Sign-In
const GoogleSignIn = async (req, res) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    return res.status(400).json({
      success: false,
      message: "Google token is required.",
    });
  }

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if the user exists
    let customer = await CustomerAuthenticationModel.findOne({ CustomerEmail: email });

    if (!customer) {
      // Create a new user if they don't exist
      customer = new CustomerAuthenticationModel({
        CustomerName: name || "Google User",
        CustomerEmail: email,
        CustomerAddress: "N/A", // Placeholder, you may want to prompt the user later
        CustomerPhoneNumber: "N/A", // Placeholder
        CustomerPassword: await bcryptjs.hash(googleId, 10), // Use Google ID as a dummy password
        googleId, // Optional: Store Google ID for reference
      });
      await customer.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Google Sign-In successful!",
      customerId: customer._id,
      customerEmail: customer.CustomerEmail,
      token,
    });
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    res.status(500).json({
      success: false,
      message: "Google Sign-In failed.",
    });
  }
};

export { CustomerLogin, CustomerSignup, ForgotPassword, ResetPassword, GoogleSignIn };