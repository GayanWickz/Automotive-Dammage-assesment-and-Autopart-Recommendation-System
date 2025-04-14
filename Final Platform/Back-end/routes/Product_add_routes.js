import express from "express";
import { AddProduct } from "../controllers/Product_add_platform_controller.js";
import multer from "multer";

const ECommerceRouter = express.Router();

// Image storage
const storage = multer.diskStorage({
  destination: "uploads", // Save files in the 'uploads' directory
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_${file.originalname}`); // Rename files to avoid conflicts
  },
});

// File validation
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."),
        false
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
});

// Route for adding a product
ECommerceRouter.post("/add", upload.array("productimages", 2), AddProduct);

// Error handling middleware for Multer
ECommerceRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer errors (e.g., file size limit exceeded)
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Handle other errors (e.g., invalid file type)
    return res.status(400).json({ message: err.message });
  }
  next();
});

export default ECommerceRouter;