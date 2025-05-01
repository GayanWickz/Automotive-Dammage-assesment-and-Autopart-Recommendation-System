import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./seller_signup.css";

const libraries = ["places"]; 

const Seller_signup = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    phoneNumber: "",
    description: "",
    password: "",
    file: null,
    location: null, // Store selected location (latitude and longitude)
  });

  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  // Google Maps configuration
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD8R5Zu_Z9S9xv4LL3RqQdrM_2DCbY2WS4", 
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(null);

  // Handle map click to set marker position
  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      location: { lat, lng }, // Update form data with selected location
    }));
  }, []);

  // Validate form data
  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required.";
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.companyEmail)
    ) {
      newErrors.companyEmail = "Invalid email address.";
    }
    if (!formData.companyAddress.trim())
      newErrors.companyAddress = "Address is required.";
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number.";
    }
    if (!formData.location)
      newErrors.location = "Please select a location on the map.";
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!formData.file) newErrors.file = "Please upload a company logo.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    } else {
      setErrors({});
    }

    // Prepare the form data for submission
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("SellerName", formData.companyName);
    formDataToSubmit.append("SellerEmail", formData.companyEmail);
    formDataToSubmit.append("SellerAddress", formData.companyAddress);
    formDataToSubmit.append("SellerPhoneNumber", formData.phoneNumber);
    formDataToSubmit.append("SellerLocation", JSON.stringify(formData.location)); // Send location as JSON
    formDataToSubmit.append("SellerDescription", formData.description);
    formDataToSubmit.append("SellerPassword", formData.password);
    formDataToSubmit.append("logoimage", formData.file);

    try {
      const response = await axios.post(
        "https://192.168.1.2:3000/api/sellerauthentication/sellersignup",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Signup successful! Wait until administration approves your account.");
        navigate("/");
      } else {
        setApiError(response.data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setApiError("An error occurred during signup.");
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="seller-signup-main">
      <div className="seller-signup-con">
        <h3 className="text-hili">Sign up</h3>
        <p>
          Ready to sell your products and reach a wider audience? Sign up to
          become a seller and start listing your items today!
        </p>
        <form className="gap" onSubmit={handleSubmit}>
          <div className="seller-signup-input-box">
            <input
              type="text"
              name="companyName"
              placeholder="Company name"
              value={formData.companyName}
              onChange={handleChange}
            />
            {errors.companyName && (
              <p className="error">{errors.companyName}</p>
            )}
          </div>
          <div className="seller-signup-input-box">
            <input
              type="text"
              name="companyEmail"
              placeholder="Company email"
              value={formData.companyEmail}
              onChange={handleChange}
            />
            {errors.companyEmail && (
              <p className="error">{errors.companyEmail}</p>
            )}
          </div>
          <div className="seller-signup-input-box">
            <input
              type="text"
              name="companyAddress"
              placeholder="Company address"
              value={formData.companyAddress}
              onChange={handleChange}
            />
            {errors.companyAddress && (
              <p className="error">{errors.companyAddress}</p>
            )}
          </div>
          <div className="seller-signup-input-box">
            <input
              type="number"
              name="phoneNumber"
              placeholder="Valid telephone number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="error">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="seller-signup-map">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              zoom={10}
              center={{ lat: 6.9271, lng: 79.8612 }} // Default center (e.g., Colombo, Sri Lanka)
              onClick={onMapClick}
            >
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
            {errors.location && <p className="error">{errors.location}</p>}
          </div>
          <div className="seller-signup-input-box seller-signup-message-box">
            <input
              name="description"
              placeholder="Enter a small description ( Limit to 100 characters )"
              value={formData.description}
              onChange={handleChange}
            />
            <p className="char-count">
              {formData.description.length}/100 characters
            </p>
            {errors.description && (
              <p className="error">{errors.description}</p>
            )}
          </div>
          <div className="seller-signup-input-box margin-top-pass">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="seller-signup-input-box-image">
            <input
              className="seller-signup-input-box-image-input"
              type="file"
              onChange={handleFileChange}
            />
            {filePreview && (
              <img
                className="seller-signup-input-image"
                src={filePreview}
                alt="Preview"
              />
            )}
            {errors.file && <p className="error">{errors.file}</p>}
          </div>
          <button className="seller-signup-buttons" type="submit">
            Signup
          </button>
        </form>
        <Link to="/Seller_login">
          <p className="gap">You already have an account? Login</p>
        </Link>
        {apiError && <p className="error">{apiError}</p>}
      </div>
    </div>
  );
};

export default Seller_signup;