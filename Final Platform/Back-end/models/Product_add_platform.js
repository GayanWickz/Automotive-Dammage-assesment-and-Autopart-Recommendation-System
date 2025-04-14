import mongoose from "mongoose";

const ECommerceSchema = new mongoose.Schema({
  SellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sellerauthenticationrequest",
    required: true,
  },
  ProductType: { type: String, required: true, enum: ["Vehicle", "Part"] },
  ProductName: { type: String, required: true },
  ShortDescription: { type: String, required: true },
  LongDescription: { type: String, required: true },
  Price: { type: Number, required: true },
  Discount: { type: Number },
  Quantity: { type: Number },
  Advertise: { type: String, required: true },
  VehicleType: { type: String },
  VehicleBrand: { type: String },
  VehicleCondition: { type: String },
  Transmission: { type: String },
  FuelType: { type: String },
  EngineCapacity: { type: Number },
  Mileage: { type: Number },
  Year: { type: Number },
  VehicleModel: { type: String }, // Added VehicleModel field
  PartCategory: { type: String },
  PartCondition: { type: String },
  PartNumber: { type: String },
  StockStatus: { type: String },
  AssociatedVehicle: { type: String },
  ImageFiles: [{ type: String }],
  PostDate: { type: Date, default: Date.now },
});

const ECommerceModel = mongoose.model("ecommerceproduct", ECommerceSchema);

export default ECommerceModel;