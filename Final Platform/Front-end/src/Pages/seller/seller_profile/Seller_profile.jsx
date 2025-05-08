import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./seller_profile.css";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const Seller_profile = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");
  const [seller, setSeller] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    SellerName: "",
    SellerEmail: "",
    SellerAddress: "",
    SellerPhoneNumber: "",
    SellerLocation: { lat: "", lng: "" },
  });
  const [logoImage, setLogoImage] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (!sellerId) {
        setError("Seller ID not found. Please log in again.");
        return;
      }

      try {
        const response = await axios.get(
          `https://192.168.137.1:3000/api/selleraccount/${sellerId}`
        );

        console.log("API Response:", response.data); // Debug log

        if (!response.data) {
          setError("No seller data returned from the server.");
          return;
        }

        const sellerData = response.data;
        setSeller(sellerData);

        // Handle SellerLocation with robust validation
        let location = defaultCenter;
        if (sellerData.SellerLocation) {
          let parsedLocation = sellerData.SellerLocation;
          // If SellerLocation is a string, parse it
          if (typeof sellerData.SellerLocation === "string") {
            try {
              parsedLocation = JSON.parse(sellerData.SellerLocation);
            } catch (e) {
              console.warn("Failed to parse SellerLocation string:", sellerData.SellerLocation, e);
            }
          }
          // Validate parsedLocation as an object with numeric lat and lng
          if (
            parsedLocation &&
            typeof parsedLocation === "object" &&
            typeof parsedLocation.lat === "number" &&
            typeof parsedLocation.lng === "number" &&
            !isNaN(parsedLocation.lat) &&
            !isNaN(parsedLocation.lng)
          ) {
            location = {
              lat: parsedLocation.lat,
              lng: parsedLocation.lng,
            };
          } else {
            console.warn("Invalid or missing SellerLocation:", sellerData.SellerLocation);
          }
        } else {
          console.warn("SellerLocation is undefined or null");
        }

        console.log("Processed Location:", location); // Debug log

        setEditData({
          SellerName: sellerData.SellerName || "",
          SellerEmail: sellerData.SellerEmail || "",
          SellerAddress: sellerData.SellerAddress || "",
          SellerPhoneNumber: sellerData.SellerPhoneNumber || "",
          SellerLocation: {
            lat: location.lat.toString(),
            lng: location.lng.toString(),
          },
        });
        setMapCenter(location);
        setMarkerPosition(location); // Set markerPosition to parsed location
      } catch (error) {
        console.error("Error fetching seller details:", error);
        if (error.response) {
          setError(
            `Failed to fetch seller details: ${error.response.data.message || error.response.statusText} (Status: ${error.response.status})`
          );
        } else if (error.request) {
          setError("No response from server. Please check your network or server status.");
        } else {
          setError(`Error: ${error.message}`);
        }
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      const newValue = value === "" ? "" : parseFloat(value) || 0;
      setMarkerPosition((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      setEditData((prevData) => ({
        ...prevData,
        SellerLocation: {
          ...prevData.SellerLocation,
          [name]: value,
        },
      }));
    } else {
      setEditData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setLogoImage(e.target.files[0]);
  };

  const handleMapClick = (event) => {
    if (!event || !event.latLng) {
      console.warn("Map click event is invalid:", event);
      return;
    }
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    console.log("Map Clicked - New Location:", { lat, lng }); // Debug log
    setMarkerPosition({ lat, lng });
    setEditData((prevData) => ({
      ...prevData,
      SellerLocation: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
    }));
    setMapCenter({ lat, lng });
  };

  const validateForm = () => {
    const errors = {};
    if (!editData.SellerName.trim()) errors.SellerName = "Name is required.";
    if (!editData.SellerEmail.trim()) {
      errors.SellerEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.SellerEmail)) {
      errors.SellerEmail = "Invalid email format.";
    }
    if (!editData.SellerAddress.trim()) errors.SellerAddress = "Address is required.";
    if (!editData.SellerPhoneNumber.trim()) {
      errors.SellerPhoneNumber = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(editData.SellerPhoneNumber)) {
      errors.SellerPhoneNumber = "Invalid phone number.";
    }
    const lat = parseFloat(editData.SellerLocation.lat);
    const lng = parseFloat(editData.SellerLocation.lng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.lat = "Latitude must be a number between -90 and 90.";
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.lng = "Longitude must be a number between -180 and 180.";
    }
    return errors;
  };

  const handleEditSubmit = async () => {
    // Validate form inputs
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      alert("Please fix the following errors:\n" + Object.values(validationErrors).join("\n"));
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("SellerName", editData.SellerName);
    formData.append("SellerEmail", editData.SellerEmail);
    formData.append("SellerAddress", editData.SellerAddress);
    formData.append("SellerPhoneNumber", editData.SellerPhoneNumber);
    formData.append(
      "SellerLocation",
      JSON.stringify({
        lat: parseFloat(editData.SellerLocation.lat),
        lng: parseFloat(editData.SellerLocation.lng),
      })
    );
    if (logoImage) {
      formData.append("LogoImageFile", logoImage);
    }

    try {
      const response = await axios.put(
        `https://192.168.137.1:3000/api/selleraccount/${sellerId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSeller(response.data);
      setIsEditing(false);
      alert("Profile updated successfully!");
      setError("");
    } catch (error) {
      console.error("Error updating seller details:", error);
      if (error.response) {
        setError(
          `Failed to update profile: ${error.response.data.message || error.response.statusText} (Status: ${error.response.status})`
        );
      } else if (error.request) {
        setError("No response from server. Please check your network or server status.");
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(
          `https://192.168.137.1:3000/api/selleraccount/${sellerId}`
        );
        localStorage.removeItem("sellerId");
        navigate("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        setError("Failed to delete account.");
      }
    }
  };

  return (
    <div>
      {seller ? (
        <div className="seller-profile-con">
          {error && <p className="error">{error}</p>}
          {isEditing ? (
            <div className="seller-profile-edit-con">
              <label>Name</label>
              <input
                type="text"
                name="SellerName"
                value={editData.SellerName}
                onChange={handleEditChange}
                placeholder="Name"
              />
              <label>Email</label>
              <input
                type="email"
                name="SellerEmail"
                value={editData.SellerEmail}
                onChange={handleEditChange}
                placeholder="Email"
              />
              <label>Address</label>
              <input
                type="text"
                name="SellerAddress"
                value={editData.SellerAddress}
                onChange={handleEditChange}
                placeholder="Address"
              />
              <label>Phone Number</label>
              <input
                type="text"
                name="SellerPhoneNumber"
                value={editData.SellerPhoneNumber}
                onChange={handleEditChange}
                placeholder="Phone Number"
              />
              <label>Location</label>
              <GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={mapCenter}
  zoom={mapCenter.lat === 0 && mapCenter.lng === 0 ? 2 : 10}
  onClick={handleMapClick}
>
  {console.log("Marker Position in Render:", markerPosition)}
  {markerPosition && <Marker position={markerPosition} />}
</GoogleMap>
              <label>Latitude</label>
              <input
                type="text"
                name="lat"
                value={editData.SellerLocation.lat}
                onChange={handleEditChange}
                placeholder="Latitude"
              />
              <label>Longitude</label>
              <input
                type="text"
                name="lng"
                value={editData.SellerLocation.lng}
                onChange={handleEditChange}
                placeholder="Longitude"
              />
              <label>Logo Image</label>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleEditSubmit}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <>
              {seller?.LogoImageFile ? (
                <img
                  className="seller-profile-image"
                  src={`https://192.168.137.1:3000/uploads/${seller.LogoImageFile}`}
                  alt={seller.LogoImageFile}
                />
              ) : (
                <p>No image available</p>
              )}
              <div className="seller-profile-detail-con">
                
                <div className="seller-profile-detail">
                  <h5 className="seller-profile-topic">Seller Name:</h5>
                  <p className="seller-profile-p">{seller.SellerName}</p>
                </div>
                <div className="seller-profile-detail">
                  <h5 className="seller-profile-topic">Seller Email:</h5>
                  <p className="seller-profile-p">{seller.SellerEmail}</p>
                </div>
                <div className="seller-profile-detail">
                  <h5 className="seller-profile-topic">Seller Address:</h5>
                  <p className="seller-profile-p">{seller.SellerAddress}</p>
                </div>
                <div className="seller-profile-detail">
                  <h5 className="seller-profile-topic">Seller PhoneNumber:</h5>
                  <p className="seller-profile-p">{seller.SellerPhoneNumber}</p>
                </div>
                
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                <button className="dlbutton" onClick={handleDeleteAccount}>Delete Profile</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p>Loading seller details...</p>
      )}
    </div>
  );
};

export default Seller_profile;