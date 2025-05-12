import express from "express";
import {
  Wishlist,
  getWishlist,
  deleteWishlistItem,
} from "../controllers/Wish_list_controller.js";

const WishlistRouter = express.Router();

WishlistRouter.post("/wishlistadd", Wishlist);
WishlistRouter.get("/wishlistdisplay/:customerId", getWishlist);
WishlistRouter.delete("/wishlistdisplay/:wishlistId", deleteWishlistItem);

export default WishlistRouter;