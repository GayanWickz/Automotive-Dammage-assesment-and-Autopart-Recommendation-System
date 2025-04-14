import ECommerceModel from "../models/Product_add_platform.js";

const AddProduct = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { ProductType } = req.body;

    // Validate ProductType
    if (!ProductType || !["Vehicle", "Part"].includes(ProductType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing ProductType (must be Vehicle or Part)"
      });
    }

    // Common required fields
    const commonFields = [
      'SellerID',
      'ProductType',
      'ProductName',
      'ShortDescription',
      'LongDescription',
      'Price',
      'Advertise',
       'VehicleBrand',
    ];

    // Validate common fields
    for (const field of commonFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Vehicle-specific validation
    if (ProductType === "Vehicle") {
      const vehicleFields = [
        'VehicleType',
        'VehicleBrand',
        'Mileage',
        'Year',
        'Transmission',
        'FuelType',
        'EngineCapacity',
        'VehicleModel', //Added VehicleModel'
       
      ];

      for (const field of vehicleFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            success: false,
            message: `Vehicle requires ${field} field`
          });
        }
      }
    }

    // Part-specific validation
    if (ProductType === "Part") {
      const partFields = [
        'Discount',
        'StockStatus',
        'Quantity',
        'PartCondition',
        'PartNumber',
        'AssociatedVehicle',
        'PartCategory', 
      ];

      for (const field of partFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            success: false,
            message: `Part requires ${field} field`
          });
        }
      }
    }

    // Handle file uploads
    const imageFileNames = req.files?.length > 0 
      ? req.files.map(file => file.filename)
      : ["default.jpg"];

    // Prepare product data with type conversions
    const productData = {
      ...req.body,
      ImageFiles: imageFileNames,
      Price: parseFloat(req.body.Price),
      Discount: req.body.Discount ? parseFloat(req.body.Discount) : 0,
      Quantity: req.body.Quantity ? parseInt(req.body.Quantity) : null,
      Mileage: req.body.Mileage ? parseInt(req.body.Mileage) : null,
      Year: req.body.Year ? parseInt(req.body.Year) : null,
      EngineCapacity: req.body.EngineCapacity ? parseInt(req.body.EngineCapacity) : null
    };

    // Handle PostDate conversion
    if (req.body.PostDate) {
      productData.PostDate = new Date(req.body.PostDate);
    }

    // Create and save product
    const newProduct = new ECommerceModel(productData);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId: newProduct._id
    });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add product",
      error: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
};

export { AddProduct };