import SellerAuthenticationModel from "../models/Seller_authentication_platform.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import validator from "validator";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import https from "https";

// Helper function to generate a JWT
const generateToken = (sellerId) => {
  return jwt.sign({ id: sellerId }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });
};

const SellerLogin = async (req, res) => {
  const { SellerEmail, SellerPassword } = req.body;

  if (!SellerEmail || !SellerPassword) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (!validator.isEmail(SellerEmail)) {
    console.log("Validation failed: Invalid email format");
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    const seller = await SellerAuthenticationModel.findOne({ SellerEmail });
    if (!seller) {
      console.log("Seller not found with email:", SellerEmail);
      return res.status(410).json({
        success: false,
        message: "Your email is not registered. Please register.",
      });
    }

    if (seller.Status === "rejected") {
      console.log("Seller account rejected:", SellerEmail);
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected. Please contact support.",
      });
    }

    if (seller.Status === "pending") {
      console.log("Seller account pending:", SellerEmail);
      return res.status(403).json({
        success: false,
        message: "Your account is not approved yet. Please wait for approval.",
        additionalInfo:
          "You will receive a notification once your account is approved.",
      });
    }

    if (seller.Status !== "accepted") {
      console.log("Seller account not accepted:", SellerEmail);
      return res.status(403).json({
        success: false,
        message: "Your account is not yet approved. Please contact support.",
      });
    }

    const isMatch = await bcryptjs.compare(
      SellerPassword,
      seller.SellerPassword
    );
    if (!isMatch) {
      console.log("Password mismatch for seller:", SellerEmail);
      return res.status(410).json({
        success: false,
        message: "Your email or password is incorrect!",
      });
    }

    const token = generateToken(seller._id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      sellerId: seller._id,
      token,
    });
  } catch (error) {
    console.error("Error during seller login:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

const SellerSignup = async (req, res) => {
  const imageFileName = req.file?.filename || "default.jpg";

  try {
    const {
      SellerName,
      SellerEmail,
      SellerAddress,
      SellerPhoneNumber,
      SellerLocation,
      SellerDescription,
      SellerPassword,
    } = req.body;

    if (
      !SellerName ||
      !SellerEmail ||
      !SellerPassword ||
      !SellerAddress ||
      !SellerPhoneNumber ||
      !SellerDescription ||
      !SellerLocation
    ) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (!validator.isEmail(SellerEmail)) {
      console.log("Validation failed: Invalid email format");
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const exists = await SellerAuthenticationModel.findOne({ SellerEmail });
    if (exists) {
      console.log("Email already registered:", SellerEmail);
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcryptjs.hash(SellerPassword, 10);

    const newSeller = new SellerAuthenticationModel({
      SellerName,
      SellerEmail,
      SellerAddress,
      SellerPhoneNumber,
      SellerLocation: JSON.parse(SellerLocation),
      SellerDescription,
      SellerPassword: hashedPassword,
      LogoImageFile: imageFileName,
    });

    await newSeller.save();
    console.log("Seller account created");

    return res.status(201).json({
      success: true,
      message: "Signup successful!",
    });
  } catch (error) {
    console.error("Error during seller signup:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to signup.",
    });
  }
};

const ForgotPassword = async (req, res) => {
  const { SellerEmail } = req.body;

  if (!SellerEmail || !validator.isEmail(SellerEmail)) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required.",
    });
  }

  try {
    const seller = await SellerAuthenticationModel.findOne({ SellerEmail });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    const resetToken = uuidv4();
    const resetTokenExpires = Date.now() + 3600000; // 1 hour expiry

    seller.resetPasswordToken = resetToken;
    seller.resetPasswordExpires = resetTokenExpires;
    await seller.save();

    const resetUrl = `https://192.168.137.1:5173/seller-reset-password/${resetToken}`;
    const emailPayload = {
      to: SellerEmail,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\nThis link will expire in 1 hour.`,
    };

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
    const seller = await SellerAuthenticationModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    seller.SellerPassword = hashedPassword;
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpires = undefined;
    await seller.save();

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

export { SellerLogin, SellerSignup, ForgotPassword, ResetPassword };