import ECommerceModel from "../models/Product_add_platform.js";

// Fetch products and populate seller details
const Display = async (req, res) => {
  try {
    const { vehicleBrand, partCategory , ratings} = req.query;
    const query = {};
    
    // Add filters if they exist in the query
    if (vehicleBrand) query.VehicleBrand = vehicleBrand;
    if (partCategory) query.PartCategory = partCategory;

 // Handle rating filter
// Handle rating filter
if (ratings) {
  const ratingArray = typeof ratings === 'string' ? [ratings] : ratings;
  query.Rating = { $in: ratingArray.map(Number) };
}


    const products = await ECommerceModel.find(query).populate(
      "SellerID",
      "SellerName LogoImageFile SellerLocation averageRating reviewCount"
    );

    // Debug logging
    console.log("Products with Seller Details:", JSON.stringify(products, null, 2));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error });
  }
};

export default Display;