import ECommerceModel from "../models/Product_add_platform.js";

const DisplayHot = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { 
      Advertise: "Hot",
      ImageFiles: { $exists: true, $ne: [] } // Ensure ImageFiles exists and is not empty
    };
    if (category) {
      query.Category = category;
    }

    const products = await ECommerceModel.find(query).populate(
      "SellerID",
      "SellerName LogoImageFile"
    );

    console.log("Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error });
  }
};

export default DisplayHot;