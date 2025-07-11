import express from "express";
import { body } from "express-validator";
import {
    deleteCustomerById,
    getCustomeraccountbyId,
    updateCustomerById,
} from "../controllers/Customer_account_controller.js";

const Customerdetails = express.Router();

// Validation rules for updating customer details
const updateCustomerValidationRules = [
    body("CustomerName").notEmpty().withMessage("Customer name is required"),
    body("CustomerEmail").isEmail().withMessage("Invalid email address"),
    body("CustomerAddress").notEmpty().withMessage("Customer address is required"),
    body("CustomerPhoneNumber")
        .isMobilePhone()
        .withMessage("Invalid phone number"),
];

// Define routes
Customerdetails.get("/:id", getCustomeraccountbyId);
Customerdetails.put("/:id", updateCustomerValidationRules, updateCustomerById);
Customerdetails.delete("/:id", deleteCustomerById);

export default Customerdetails;