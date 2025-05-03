import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../server.js";
import { connectTestDB, disconnectTestDB } from "./testSetup.js";
import { generateRandomUserData, setTestseller, getTestseller } from "./testseller.js";
import sellerauthenticationrequest from "../../models/Seller_authentication_platform.js"; // Corrected import name

beforeAll(connectTestDB); // Connect to the database 
afterAll(disconnectTestDB); // Disconnect db

describe("Unit Test: Seller Signup and Login", () => {
  let sellerData;

  beforeAll(() => {
    sellerData = generateRandomUserData();
    setTestseller(sellerData);
  });

  it("should send a signup request and automatically approve the seller", async () => {
    const response = await request(app)
      .post("/api/sellerauthentication/sellersignup")
      .set("Content-Type", "multipart/form-data") // Explicitly set the content type for file upload
      .field("SellerName", sellerData.SellerName)
      .field("SellerEmail", sellerData.SellerEmail)
      .field("SellerPassword", sellerData.SellerPassword)
      .field("SellerAddress", sellerData.SellerAddress)
      .field("SellerPhoneNumber", sellerData.SellerPhoneNumber)
      .field("SellerLocation", JSON.stringify({ lat: 6.9271, lng: 79.8612 })) 
      .field("SellerDescription", sellerData.SellerDescription)
      .attach("logoimage", Buffer.from("FakeImageContent"), "logo.jpg"); 

    // Log the response for debugging
    if (response.body.success && response.body.message.includes("Signup successful!")) {
      console.log("Terminal Message: Signup successful! Seller is automatically approved.");
    } else {
      console.log("Terminal Message: Unexpected response received:", response.body);
    }

    // Assertions 
    expect(response.status).toBe(201); // Created
    expect(response.body.message).toContain("Signup successful!"); // Success message
    expect(response.body.success).toBe(true); // Ensure success is true

    // Verify the seller is automatically approved
    const sellerInDb = await sellerauthenticationrequest.findOne({ SellerEmail: sellerData.SellerEmail });
    expect(sellerInDb).toBeDefined(); // Ensure the seller was created
    expect(sellerInDb.Status).toBe("accepted"); // Verify the status is automatically set to "accepted"
  });

  it("should fail to sign up a seller with missing required fields", async () => {
    const response = await request(app)
      .post("/api/sellerauthentication/sellersignup")
      .send({}); // Send an empty object

    console.log("Signup Failure Response:", response.body);

    expect(response.status).toBe(400); // Bad Request
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("All fields are required"); 
  });
});