import ECommerceModel from "../models/Product_add_platform.js";
import sellerauthenticationrequest from "../models/Seller_authentication_platform.js";
// Get product by ID
// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ECommerceModel.findById(id)
      .populate({
        path: 'SellerID',
        select: 'SellerName SellerEmail SellerAddress SellerPhoneNumber LogoImageFile',
        model: sellerauthenticationrequest
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product", error });
  }
};
