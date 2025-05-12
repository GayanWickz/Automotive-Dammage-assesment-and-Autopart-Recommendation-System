import React, { useState } from "react";
import axios from "axios";

const Review = ({ sellerId }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleStarClick = (selectedRating) => {
        setRating(selectedRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/reviews", {
                sellerId,
                rating,
                comment,
            });
            alert("Review submitted successfully!");
            setRating(0);
            setComment("");
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        }
    };

    return (
        <div>
            <h2>Add a Review</h2>
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? "filled" : ""}`}
                        onClick={() => handleStarClick(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment..."
            />
            <button onClick={handleSubmit}>Submit Review</button>
        </div>
    );
};

export default Review;