import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./add_product.css";

const Advertise = [
  { value: "None", label: "None" },
  { value: "Hot", label: "Hot" },
  { value: "Offers", label: "Offers" },
];
const TransmissionOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" }
];
const FuelTypeOptions = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" }
];
const VehicleType = [
  { value: "Car", label: "Car" },
  { value: "Motorcycle", label: "Motorcycle" },
  { value: "Truck", label: "Truck" },
  { value: "SUV", label: "SUV" },
  { value: "Van", label: "Van" },
];

const VehicleBrand = [
  { value: "Toyota", label: "Toyota" },
  { value: "Honda", label: "Honda" },
  { value: "Ford", label: "Ford" },
  { value: "Chevrolet", label: "Chevrolet" },
  { value: "BMW", label: "BMW" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
  { value: "Audi", label: "Audi" },
  { value: "Nissan", label: "Nissan" },
  { value: "Hyundai", label: "Hyundai" },
  { value: "Kia", label: "Kia" },
];

const PartCategory = [
  { value: "Engine", label: "Engine" },
  { value: "Transmission", label: "Transmission" },
  { value: "Brakes", label: "Brakes" },
  { value: "Suspension", label: "Suspension" },
  { value: "Exhaust", label: "Exhaust" },
  { value: "Electrical", label: "Electrical" },
  { value: "Interior", label: "Interior" },
  { value: "Exterior", label: "Exterior" },
];

const StockStatus = [
  { value: "InStock", label: "In Stock" },
  { value: "OutOfStock", label: "Out of Stock" },
];

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    productType: "Vehicle", 
    productName: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    discount: "", 
    quantity: "", 
    advertise: null,
    vehicleType: "",
    vehicleBrand: null,
    vehicleCondition: null,
    transmission: null,
    fuelType: "",
    engineCapacity: "",
    mileage: "",
    year: "",
    vehicleModel: "",
    partCategory: "",
    partCondition: "",
    partNumber: "",
    stockStatus: null,
    associatedVehicle: null, 
  });
  const [errors, setErrors] = useState({});
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, selected) => {
    setFormData({ ...formData, [name]: selected });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length + files.length > 2) {
      setErrors((prev) => ({
        ...prev,
        files: "You can upload a maximum of 2 images.",
      }));
      return;
    }
    setFiles([...files, ...newFiles]);
    setFilePreviews([...filePreviews, ...newFiles.map((file) => URL.createObjectURL(file))]);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required.";
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required.";
    } else if (formData.shortDescription.length > 25) {
      newErrors.shortDescription =
        "Short description must not exceed 25 characters.";
    }

    if (!formData.longDescription.trim()) {
      newErrors.longDescription = "Long description is required.";
    } else if (formData.longDescription.length > 250) {
      newErrors.longDescription =
        "Long description must not exceed 250 characters.";
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Please enter a valid price.";
    }

    if (formData.productType === "Part") {
      if (
        !formData.discount ||
        isNaN(formData.discount) ||
        formData.discount < 0 ||
        formData.discount > 100
      ) {
        newErrors.discount = "Please enter a valid discount (0-100%).";
      }

      if (
        !formData.quantity ||
        isNaN(formData.quantity) ||
        formData.quantity <= 0
      ) {
        newErrors.quantity = "Please enter a valid quantity.";
      }

      if (!formData.stockStatus?.value) {
        newErrors.stockStatus = "Please select a stock status.";
      }

      if (!formData.associatedVehicle?.value) {
        newErrors.associatedVehicle = "Please select an associated vehicle.";
      }
    }

    if (!formData.advertise?.value) {
      newErrors.advertise = "Please select an advertise option.";
    }

    if (formData.productType === "Vehicle" && !formData.vehicleType?.value) {
      newErrors.vehicleType = "Please select a vehicle type.";
    }

    if (!formData.vehicleBrand?.value) {
      newErrors.vehicleBrand = "Please select a vehicle brand.";
    }

    if (formData.productType === "Part" && !formData.partCategory?.value) {
      newErrors.partCategory = "Please select a part category.";
    }

    if (formData.productType === "Vehicle" && (!formData.mileage || isNaN(formData.mileage))) {
      newErrors.mileage = "Please enter a valid mileage.";
    }

    if (formData.productType === "Vehicle" && (!formData.year || isNaN(formData.year))) {
      newErrors.year = "Please enter a valid year.";
    }

    if (formData.productType === "Part" && !formData.partCondition) {
      newErrors.partCondition = "Please describe the condition of the part.";
    }

    if (formData.productType === "Vehicle" && !formData.vehicleModel.trim()) {
      newErrors.vehicleModel = "Vehicle model is required.";
    }
    if (formData.productType === "Vehicle") {
      if (!formData.transmission?.value) {
        newErrors.transmission = "Please select transmission type";
      }
      if (!formData.fuelType?.value) {
        newErrors.fuelType = "Please select fuel type";
      }
      if (!formData.engineCapacity || isNaN(formData.engineCapacity)) {
        newErrors.engineCapacity = "Please enter valid engine capacity";
      }
    }
    if (formData.productType === "Part" && !formData.partNumber.trim()) {
      newErrors.partNumber = "Part number is required.";
    }

    if (files.length === 0) {
      newErrors.files = "Please upload at least one image.";
    } else if (files.length > 2) {
      newErrors.files = "You can upload a maximum of 2 images.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const sellerId = localStorage.getItem("sellerId");
    if (!sellerId) {
      alert("Seller ID is missing. Please login again.");
      return;
    }

    const postDate = new Date().toISOString();

    const formDataToSend = new FormData();
    formDataToSend.append("SellerID", sellerId);
    formDataToSend.append("ProductType", formData.productType);
    formDataToSend.append("ProductName", formData.productName);
    formDataToSend.append("ShortDescription", formData.shortDescription);
    formDataToSend.append("LongDescription", formData.longDescription);
    formDataToSend.append("Price", formData.price);
    formDataToSend.append("Advertise", formData.advertise?.value || "");
    formDataToSend.append("PostDate", postDate);
    formDataToSend.append("VehicleBrand", formData.vehicleBrand?.value || "");

    if (formData.productType === "Vehicle") {
      formDataToSend.append("VehicleType", formData.vehicleType?.value || "");
      formDataToSend.append("Mileage", formData.mileage);
      formDataToSend.append("Year", formData.year);
      formDataToSend.append("VehicleModel", formData.vehicleModel);
      formDataToSend.append("Transmission", formData.transmission?.value || "");
      formDataToSend.append("FuelType", formData.fuelType?.value || "");
      formDataToSend.append("EngineCapacity", formData.engineCapacity);
      
    } else if (formData.productType === "Part") {
      formDataToSend.append("PartCategory", formData.partCategory?.value || "");
      formDataToSend.append("PartCondition", formData.partCondition);
      formDataToSend.append("PartNumber", formData.partNumber);
      formDataToSend.append("StockStatus", formData.stockStatus?.value || "");
      formDataToSend.append("Discount", formData.discount);
      formDataToSend.append("Quantity", formData.quantity);
      formDataToSend.append("AssociatedVehicle", formData.associatedVehicle?.value || "");
    }

    files.forEach((file) => {
      formDataToSend.append("productimages", file);
    });

    setLoading(true);

    try {
      const response = await axios.post(
        "https://192.168.137.1:3000/api/ecommerceproduct/add",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Product added successfully!");
        setFormData({
          productType: "Vehicle",
          productName: "",
          shortDescription: "",
          longDescription: "",
          price: "",
          discount: "",
          quantity: "",
          advertise: null,
          vehicleType: null,
          vehicleBrand: null,
          vehicleCondition: null,
          transmission: null,
          fuelType: null,
          engineCapacity: "",
          mileage: "",
          year: "",
          vehicleModel: "",
          partCategory: null,
          partCondition: "",
          partNumber: "",
          stockStatus: null,
          associatedVehicle: null,
        });
        setFiles([]);
        setFilePreviews([]);
        setErrors({});
      } else {
        alert(response.data.message || "Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response) {
        console.error("Backend response:", error.response.data); // Log the backend error message
      }
      alert("An error occurred while adding the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="product-add-con">
        <h3 className="text-hili">Add a Product</h3>
        <p>
          Please fill in the details of the product you want to sell.
        </p>
        <div className="form-buttons">
          <button
            className={`form-button ${formData.productType === "Vehicle" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, productType: "Vehicle" })}
          >
            Sell Vehicle
          </button>
          <button
            className={`form-button ${formData.productType === "Part" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, productType: "Part" })}
          >
            Sell Vehicle Part
          </button>
        </div>
        {formData.productType === "Vehicle" ? (
          <form className="gap" onSubmit={handleSubmit}>
            <div className="product-add-input-box">
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter vehicle model (e.g., Axio)"
              />
              {errors.productName && (
                <p className="error">{errors.productName}</p>
              )}
            </div>

            <div className="product-add-input-box-select">
  <Select
    placeholder="Transmission"
    options={TransmissionOptions}
    value={formData.transmission}
    onChange={(selected) => handleSelectChange("transmission", selected)}
  />
  {errors.transmission && <p className="error">{errors.transmission}</p>}
</div>

<div className="product-add-input-box-select">
  <Select
    placeholder="Fuel Type"
    options={FuelTypeOptions}
    value={formData.fuelType}
    onChange={(selected) => handleSelectChange("fuelType", selected)}
  />
  {errors.fuelType && <p className="error">{errors.fuelType}</p>}
</div>

<div className="product-add-input-box">
  <input
    type="number"
    name="engineCapacity"
    value={formData.engineCapacity}
    onChange={handleInputChange}
    placeholder="Engine Capacity (cc)"
  />
  {errors.engineCapacity && <p className="error">{errors.engineCapacity}</p>}
</div>
            <div className="product-add-input-box">
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Enter short description (Limit to 25 characters)"
              />
              <p className="char-count">
                {formData.shortDescription.length}/25 characters
              </p>
              {errors.shortDescription && (
                <p className="error">{errors.shortDescription}</p>
              )}
            </div>
            <div className="product-add-input-box product-add-message-box margin-top-add">
              <input
                type="text"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                placeholder="Enter long description (Limit to 250 characters)"
              />
              <p className="char-count">
                {formData.longDescription.length}/250 characters
              </p>
              {errors.longDescription && (
                <p className="error">{errors.longDescription}</p>
              )}
            </div>
            <div className="product-add-input-box margin-top-add">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price"
              />
              {errors.price && <p className="error">{errors.price}</p>}
            </div>
            <div className="product-add-input-box-select">
              <Select
                placeholder="Advertise"
                options={Advertise}
                value={formData.advertise}
                onChange={(selected) => handleSelectChange("advertise", selected)}
              />
            </div>
            {errors.advertise && <p className="error">{errors.advertise}</p>}
            <div className="product-add-input-box-select">
              <Select
                placeholder="Vehicle Type"
                options={VehicleType}
                value={formData.vehicleType}
                onChange={(selected) => handleSelectChange("vehicleType", selected)}
              />
            </div>
            {errors.vehicleType && <p className="error">{errors.vehicleType}</p>}
            <div className="product-add-input-box-select">
              <Select
                placeholder="Vehicle Brand"
                options={VehicleBrand}
                value={formData.vehicleBrand}
                onChange={(selected) => handleSelectChange("vehicleBrand", selected)}
              />
            </div>
            {errors.vehicleBrand && <p className="error">{errors.vehicleBrand}</p>}
            <div className="product-add-input-box">
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                placeholder="Mileage"
              />
              {errors.mileage && <p className="error">{errors.mileage}</p>}
            </div>
            <div className="product-add-input-box">
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="Year"
              />
              {errors.year && <p className="error">{errors.year}</p>}
            </div>
            <div className="product-add-input-box">
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                placeholder="Vehicle Model (e.g., Axio)"
              />
              {errors.vehicleModel && <p className="error">{errors.vehicleModel}</p>}
            </div>
            {/* Inside the Vehicle form (AddProduct.js) */}

            <div className="product-add-input-box-image">
              <input
                className="product-add-input-box-image-input"
                type="file"
                onChange={handleFileChange}
                multiple
              />
              {filePreviews.map((preview, index) => (
                <img
                  key={index}
                  className="product-add-input-image"
                  src={preview}
                  alt={`Preview ${index + 1}`}
                />
              ))}
              {errors.files && <p className="error">{errors.files}</p>}
            </div>
            <button className="product-add-button" disabled={loading}>
              {loading ? "Adding..." : "Add Vehicle"}
            </button>
          </form>
        ) : (
          <form className="gap" onSubmit={handleSubmit}>
            <div className="product-add-input-box">
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter part name"
              />
              {errors.productName && (
                <p className="error">{errors.productName}</p>
              )}
            </div>
            <div className="product-add-input-box">
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Enter short description (Limit to 25 characters)"
              />
              <p className="char-count">
                {formData.shortDescription.length}/25 characters
              </p>
              {errors.shortDescription && (
                <p className="error">{errors.shortDescription}</p>
              )}
            </div>
            <div className="product-add-input-box product-add-message-box margin-top-add">
              <input
                type="text"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                placeholder="Enter long description (Limit to 250 characters)"
              />
              <p className="char-count">
                {formData.longDescription.length}/250 characters
              </p>
              {errors.longDescription && (
                <p className="error">{errors.longDescription}</p>
              )}
            </div>
            <div className="product-add-input-box margin-top-add">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price"
              />
              {errors.price && <p className="error">{errors.price}</p>}
            </div>
            <div className="product-add-input-box">
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="Discount (%)"
              />
              {errors.discount && <p className="error">{errors.discount}</p>}
            </div>
            <div className="product-add-input-box">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
              />
              {errors.quantity && <p className="error">{errors.quantity}</p>}
            </div>
            <div className="product-add-input-box-select">
              <Select
                placeholder="Advertise"
                options={Advertise}
                value={formData.advertise}
                onChange={(selected) => handleSelectChange("advertise", selected)}
              />
            </div>
            {errors.advertise && <p className="error">{errors.advertise}</p>}
            <div className="product-add-input-box-select">
              <Select
                placeholder="Part Category"
                options={PartCategory}
                value={formData.partCategory}
                onChange={(selected) => handleSelectChange("partCategory", selected)}
              />
            </div>
            {errors.partCategory && <p className="error">{errors.partCategory}</p>}
            <div className="product-add-input-box-select">
              <Select
                placeholder="Vehicle Brand"
                options={VehicleBrand}
                value={formData.vehicleBrand}
                onChange={(selected) => handleSelectChange("vehicleBrand", selected)}
              />
            </div>
            {errors.vehicleBrand && <p className="error">{errors.vehicleBrand}</p>}
            <div className="product-add-input-box">
              <input
                type="text"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                placeholder="Part Number (e.g., 1234-5678)"
              />
              {errors.partNumber && <p className="error">{errors.partNumber}</p>}
            </div>
            <div className="product-add-input-box">
              <input
                type="text"
                name="partCondition"
                value={formData.partCondition}
                onChange={handleInputChange}
                placeholder="Condition (e.g., New, Used, Refurbished)"
              />
              {errors.partCondition && <p className="error">{errors.partCondition}</p>}
            </div>
            <div className="product-add-input-box-select">
              <Select
                placeholder="Stock Status"
                options={StockStatus}
                value={formData.stockStatus}
                onChange={(selected) => handleSelectChange("stockStatus", selected)}
              />
            </div>
            {errors.stockStatus && <p className="error">{errors.stockStatus}</p>}
            <div className="product-add-input-box-select">
              <Select
                placeholder="Associated Vehicle"
                options={VehicleBrand}
                value={formData.associatedVehicle}
                onChange={(selected) => handleSelectChange("associatedVehicle", selected)}
              />
            </div>
            {errors.associatedVehicle && <p className="error">{errors.associatedVehicle}</p>}
            <div className="product-add-input-box-image">
              <input
                className="product-add-input-box-image-input"
                type="file"
                onChange={handleFileChange}
                multiple
              />
              {filePreviews.map((preview, index) => (
                <img
                  key={index}
                  className="product-add-input-image"
                  src={preview}
                  alt={`Preview ${index + 1}`}
                />
              ))}
              {errors.files && <p className="error">{errors.files}</p>}
            </div>
            <button className="product-add-button" disabled={loading}>
              {loading ? "Adding..." : "Add Part"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProduct;