import express from "express";
import sellerauthenticationrequest from "../models/Seller_authentication_platform.js";
import {
  SellerLogin,
  SellerSignup,
  ForgotPassword,
  ResetPassword,
} from "../controllers/Seller_authentication_controller.js";
import multer from "multer";

const SellerAuthenticationRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
      );
    }
    cb(null, true);
  },
});

SellerAuthenticationRouter.post(
  "/sellersignup",
  upload.single("logoimage"),
  SellerSignup
);

SellerAuthenticationRouter.post("/sellerlogin", SellerLogin);

SellerAuthenticationRouter.post("/forgot-password", ForgotPassword);

SellerAuthenticationRouter.post("/reset-password", ResetPassword);

SellerAuthenticationRouter.get("/", async (req, res) => {
  try {
    const sellers = await sellerauthenticationrequest.find();
    res.json(sellers);
  } catch (err) {
    console.error("Error fetching seller data: ", err);
    res.status(500).json({ message: "Error fetching seller data" });
  }
});

SellerAuthenticationRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const seller = await sellerauthenticationrequest.findByIdAndDelete(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting seller" });
  }
});

SellerAuthenticationRouter.put("/:id", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["accepted", "rejected", "pending"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updatedSeller = await sellerauthenticationrequest.findByIdAndUpdate(
      req.params.id,
      { $set: { Status: status } },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller status:", error.message);
    res.status(500).json({ message: "Error updating status" });
  }
});

SellerAuthenticationRouter.get("/total-sellers", async (req, res) => {
  try {
    const totalSellers = await sellerauthenticationrequest.countDocuments();
    console.log("Total Sellers Count:", totalSellers);
    res.json({ totalSellers });
  } catch (err) {
    console.error("Error fetching total sellers:", err);
    res.status(500).json({ message: "Error fetching total sellers" });
  }
});

export default SellerAuthenticationRouter;