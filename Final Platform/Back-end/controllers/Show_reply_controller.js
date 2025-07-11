import mongoose from "mongoose";
import AskQuestionsModel from "../models/Ask_questions_platform.js";


// Controller to get questions by Customer ID
export const getQuestionsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Customer ID format.",
      });
    }

    const questions = await AskQuestionsModel.find({ CustomerID: customerId })
      .populate({
        path: "ProductID",
        select: "ProductName ImageFiles",
      })
      .populate({
        path: "CustomerID",
        select: "CustomerName"
      })
      .exec();

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this customer.",
        questions: [] // Return empty array instead of error if preferred
      });
    }

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
      error: error.message
    });
  }
};

// Controller to add a reply and broadcast it via WebSocket
export const addReplyAndBroadcast = async (req, res) => {
  try {
    const { questionId, replyText, repliedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Question ID format.",
      });
    }

    // Add the reply to the database
    const question = await AskQuestionsModel.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const reply = {
      replyText,
      repliedBy,
      repliedAt: new Date(),
    };

    question.replies.push(reply);
    await question.save();


    res.status(200).json({
      success: true,
      message: "Reply added and broadcast successfully.",
      reply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply.",
    });
  }
};
