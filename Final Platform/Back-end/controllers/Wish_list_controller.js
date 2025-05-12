import WishlistModel from "../models/Wish_list_platform.js";

// Add to wishlist
const Wishlist = async (req, res) => {
  try {
    const { CustomerID, ProductID } = req.body;
    if (!CustomerID || !ProductID) {
      return res.status(400).json({
        success: false,
        message: "CustomerID and ProductID are required.",
      });
    }
    const existingWishlistItem = await WishlistModel.findOne({
      CustomerID,
      ProductID,
    });
    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist.",
      });
    }
    const newWishlist = new WishlistModel({
      CustomerID,
      ProductID,
    });
    await newWishlist.save();
    res.status(201).json({
      success: true,
      message: "Added to wishlist successfully!",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist.",
    });
  }
};

// Fetch wishlist by customer ID
const getWishlist = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const wishlist = await WishlistModel.find({ CustomerID: customerId }).populate(
      "ProductID"
    );
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist.",
    });
  }
};

// Delete wishlist item
const deleteWishlistItem = async (req, res) => {
  try {
    const wishlistId = req.params.wishlistId;
    const wishlistItem = await WishlistModel.findByIdAndDelete(wishlistId);
    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Wishlist item deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting wishlist item:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete wishlist item.",
    });
  }
};

export { Wishlist, getWishlist, deleteWishlistItem };