import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import { connectTestDB, disconnectTestDB } from "./testSetup.js";
import { generateRandomUserData, setTestseller, getTestseller } from "./testseller.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import sellerauthenticationrequest from "../../models/Seller_authentication_platform.js";
import ECommerceModel from "../../models/Product_add_platform.js";

// Setup in-memory MongoDB server
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectTestDB(uri); // Connect to in-memory DB
}, 3000000);
afterAll(async () => {
  await disconnectTestDB();
  await mongoServer.stop(); // Stop in-memory DB
});

describe("Unit Test: Add Product", () => {
  let sellerData;
  let token;
  let sellerId;

  beforeEach(async () => {
    // Clear the database
    await sellerauthenticationrequest.deleteMany({});
    await ECommerceModel.deleteMany({});

    // Create a new seller
    sellerData = generateRandomUserData();
    setTestseller(sellerData);

    // Sign up the seller
    const signupResponse = await request(app)
      .post("/api/sellerauthentication/sellersignup")
      .set("Content-Type", "multipart/form-data")
      .field("SellerName", sellerData.SellerName)
      .field("SellerEmail", sellerData.SellerEmail)
      .field("SellerPassword", sellerData.SellerPassword)
      .field("SellerAddress", sellerData.SellerAddress)
      .field("SellerPhoneNumber", sellerData.SellerPhoneNumber)
      .field("SellerLocation", JSON.stringify({ lat: 6.9271, lng: 79.8612 }))
      .field("SellerDescription", sellerData.SellerDescription)
      .attach("logoimage", Buffer.from("FakeImageContent"), "logo.jpg");

    expect(signupResponse.status).toBe(201);

    // Log in to get token and sellerId
    const loginResponse = await request(app)
      .post("/api/sellerauthentication/sellerlogin")
      .send({
        SellerEmail: sellerData.SellerEmail,
        SellerPassword: sellerData.SellerPassword,
      });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.token;
    sellerId = loginResponse.body.sellerId;
    expect(token).toBeDefined();
    expect(sellerId).toBeDefined();
  });

  it("should allow a seller to add a vehicle product successfully", async () => {
    const imagePath = path.resolve(__dirname, "./test_image.jpeg");

    if (!fs.existsSync(imagePath)) {
      throw new Error("Test image file not found: " + imagePath);
    }

    const vehicleData = {
      ProductType: "Vehicle",
      ProductName: "Toyota Axio",
      ShortDescription: "Reliable sedan",
      LongDescription: "A fuel-efficient Toyota Axio in excellent condition.",
      Price: 25000,
      Advertise: "Hot",
      VehicleType: "Car",
      VehicleBrand: "Toyota",
      Mileage: 50000,
      Year: 2018,
      VehicleModel: "Axio",
      Transmission: "Automatic",
      FuelType: "Petrol",
      EngineCapacity: 1500,
      PostDate: new Date().toISOString(),
    };

    const addProductResponse = await request(app)
      .post("/api/ecommerceproduct/add")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "multipart/form-data")
      .field("SellerID", sellerId)
      .field("ProductType", vehicleData.ProductType)
      .field("ProductName", vehicleData.ProductName)
      .field("ShortDescription", vehicleData.ShortDescription)
      .field("LongDescription", vehicleData.LongDescription)
      .field("Price", vehicleData.Price)
      .field("Advertise", vehicleData.Advertise)
      .field("VehicleType", vehicleData.VehicleType)
      .field("VehicleBrand", vehicleData.VehicleBrand)
      .field("Mileage", vehicleData.Mileage)
      .field("Year", vehicleData.Year)
      .field("VehicleModel", vehicleData.VehicleModel)
      .field("Transmission", vehicleData.Transmission)
      .field("FuelType", vehicleData.FuelType)
      .field("EngineCapacity", vehicleData.EngineCapacity)
      .field("PostDate", vehicleData.PostDate)
      .attach("productimages", imagePath);

    console.log("Add Vehicle Product Response:", addProductResponse.body);

    expect(addProductResponse.status).toBe(201);
    expect(addProductResponse.body.success).toBe(true);
    expect(addProductResponse.body.message).toBe("Product added successfully");
    expect(addProductResponse.body.productId).toBeDefined();

    // Verify product in database
    const productInDb = await ECommerceModel.findOne({ ProductName: vehicleData.ProductName });
    expect(productInDb).toBeDefined();
    expect(productInDb.ProductType).toBe("Vehicle");
    expect(productInDb.SellerID.toString()).toBe(sellerId);
    expect(productInDb.ImageFiles).toHaveLength(1);
    expect(productInDb.Price).toBe(25000);
    expect(productInDb.Transmission).toBe("Automatic");
    expect(productInDb.FuelType).toBe("Petrol");
    expect(productInDb.EngineCapacity).toBe(1500);
  });

  it("should allow a seller to add a part product successfully", async () => {
    const imagePath = path.resolve(__dirname, "./test_image.jpeg");

    if (!fs.existsSync(imagePath)) {
      throw new Error("Test image file not found: " + imagePath);
    }

    const partData = {
      ProductType: "Part",
      ProductName: "Brake Pads",
      ShortDescription: "High-quality brake pads",
      LongDescription: "Durable brake pads for Toyota vehicles.",
      Price: 50,
      Discount: 10,
      Quantity: 100,
      Advertise: "Offers",
      PartCategory: "Brakes",
      VehicleBrand: "Toyota",
      PartCondition: "New",
      PartNumber: "BP1234",
      StockStatus: "InStock",
      AssociatedVehicle: "Toyota",
      PostDate: new Date().toISOString(),
    };

    const addProductResponse = await request(app)
      .post("/api/ecommerceproduct/add")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "multipart/form-data")
      .field("SellerID", sellerId)
      .field("ProductType", partData.ProductType)
      .field("ProductName", partData.ProductName)
      .field("ShortDescription", partData.ShortDescription)
      .field("LongDescription", partData.LongDescription)
      .field("Price", partData.Price)
      .field("Discount", partData.Discount)
      .field("Quantity", partData.Quantity)
      .field("Advertise", partData.Advertise)
      .field("PartCategory", partData.PartCategory)
      .field("VehicleBrand", partData.VehicleBrand)
      .field("PartCondition", partData.PartCondition)
      .field("PartNumber", partData.PartNumber)
      .field("StockStatus", partData.StockStatus)
      .field("AssociatedVehicle", partData.AssociatedVehicle)
      .field("PostDate", partData.PostDate)
      .attach("productimages", imagePath);

    console.log("Add Part Product Response:", addProductResponse.body);

    expect(addProductResponse.status).toBe(201);
    expect(addProductResponse.body.success).toBe(true);
    expect(addProductResponse.body.message).toBe("Product added successfully");
    expect(addProductResponse.body.productId).toBeDefined();

    // Verify product in database
    const productInDb = await ECommerceModel.findOne({ ProductName: partData.ProductName });
    expect(productInDb).toBeDefined();
    expect(productInDb.ProductType).toBe("Part");
    expect(productInDb.SellerID.toString()).toBe(sellerId);
    expect(productInDb.ImageFiles).toHaveLength(1);
    expect(productInDb.Price).toBe(50);
    expect(productInDb.Discount).toBe(10);
    expect(productInDb.Quantity).toBe(100);
  });

  it("should fail to add a product with missing required fields", async () => {
    const addProductResponse = await request(app)
      .post("/api/ecommerceproduct/add")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "multipart/form-data")
      .field("ProductType", "Vehicle") // Only ProductType provided
      .field("SellerID", sellerId);

    console.log("Add Product Failure Response:", addProductResponse.body);

    expect(addProductResponse.status).toBe(400);
    expect(addProductResponse.body.success).toBe(false);
    expect(addProductResponse.body.message).toContain("Missing required field: ProductName");
  });

  it("should fail to add a product with invalid ProductType", async () => {
    const imagePath = path.resolve(__dirname, "./test_image.jpeg");

    if (!fs.existsSync(imagePath)) {
      throw new Error("Test image file not found: " + imagePath);
    }

    const invalidData = {
      ProductType: "Invalid",
      ProductName: "Toyota Axio",
      ShortDescription: "Reliable sedan",
      LongDescription: "A fuel-efficient Toyota Axio in excellent condition.",
      Price: 25000,
      Advertise: "Hot",
      VehicleBrand: "Toyota",
      PostDate: new Date().toISOString(),
    };

    const addProductResponse = await request(app)
      .post("/api/ecommerceproduct/add")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "multipart/form-data")
      .field("SellerID", sellerId)
      .field("ProductType", invalidData.ProductType)
      .field("ProductName", invalidData.ProductName)
      .field("ShortDescription", invalidData.ShortDescription)
      .field("LongDescription", invalidData.LongDescription)
      .field("Price", invalidData.Price)
      .field("Advertise", invalidData.Advertise)
      .field("VehicleBrand", invalidData.VehicleBrand)
      .field("PostDate", invalidData.PostDate)
      .attach("productimages", imagePath);

    console.log("Add Product Invalid ProductType Response:", addProductResponse.body);

    expect(addProductResponse.status).toBe(400);
    expect(addProductResponse.body.success).toBe(false);
    expect(addProductResponse.body.message).toContain("Invalid or missing ProductType");
  });

 
});