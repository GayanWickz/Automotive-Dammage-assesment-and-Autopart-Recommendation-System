import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sellerauthenticationrequest",
        required: true,
    },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
});

const ReviewModel = mongoose.model("review", ReviewSchema);

export default ReviewModel;