// reviews.js (or wherever you handle routes)
import express from "express";
import ReviewModel from "../models/review.js"; // Assuming you have ReviewModel
import sellerauthenticationrequest from "../models/Seller_authentication_platform.js"; // Assuming you have this model
import mongoose from "mongoose"; // Import mongoose to use ObjectId

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { sellerId, rating, comment } = req.body;
        
        // Save the new review
        const newReview = new ReviewModel({ sellerId, rating, comment });
        await newReview.save();

        // Update the seller's stats atomically
        const result = await sellerauthenticationrequest.findByIdAndUpdate(
            sellerId,
            [
                {
                    $set: {
                        reviewCount: { $add: ["$reviewCount", 1] },
                        totalRatings: { $add: ["$totalRatings", rating] },
                        averageRating: {
                            $divide: [
                                { $add: ["$totalRatings", rating] },
                                { $add: ["$reviewCount", 1] }
                            ]
                        }
                    }
                }
            ],
            { new: true } 
        );

        if (!result) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Failed to add review" });
    }
});

export default router;