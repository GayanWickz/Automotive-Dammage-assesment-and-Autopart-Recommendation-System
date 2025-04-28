import AskQuestionsModel from "../models/Ask_questions_platform.js";
import mongoose from "mongoose";

const AskQuestions = async (req, res) => {
  try {
    const { CustomerID, ProductID, Question } = req.body;

    if (!CustomerID || !ProductID || !Question) {
      return res.status(400).json({
        success: false,
        message: "CustomerID, ProductID, and Question are required fields.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(CustomerID) || 
        !mongoose.Types.ObjectId.isValid(ProductID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    const newQuestion = new AskQuestionsModel({
      CustomerID,
      ProductID,
      Question,
      Answer: "pending" // Set default answer status
    });

    await newQuestion.save();

    // Populate the product details before sending response if needed
    const populatedQuestion = await AskQuestionsModel.findById(newQuestion._id)
      .populate('ProductID', 'ProductName ImageFiles')
      .exec();

    res.status(201).json({
      success: true,
      message: "Question submitted successfully!",
      question: populatedQuestion
    });
  } catch (error) {
    console.error("Error submitting question:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to submit question",
      error: error.message
    });
  }
};

export { AskQuestions };