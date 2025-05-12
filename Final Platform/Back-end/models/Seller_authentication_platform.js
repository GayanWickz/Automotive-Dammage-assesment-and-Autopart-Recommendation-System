import mongoose from "mongoose";

const SellerauthenticationSchema = new mongoose.Schema({
  SellerName: { type: String, required: true },
  SellerEmail: { type: String, required: true, unique: true },
  SellerAddress: { type: String, required: true },
  SellerPhoneNumber: { type: String, required: true },
  SellerLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  SellerDescription: { type: String, required: true },
  SellerPassword: { type: String, required: true },
  LogoImageFile: { type: String, required: true },
  Status: {
    type: String,
    enum: ["accepted", "rejected", "pending"],
    default: "accepted",
  },
  totalRatings: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

const SellerAuthenticationModel = mongoose.model(
  "sellerauthenticationrequest",
  SellerauthenticationSchema
);

export default SellerAuthenticationModel;