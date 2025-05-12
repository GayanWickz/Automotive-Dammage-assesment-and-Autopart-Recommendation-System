import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./wish_list.css";

const Wish_list = () => {
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const customerId = localStorage.getItem("customerId");
  const navigate = useNavigate();

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`/api/wishlistdisplay/${customerId}`);
        setWishlist(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError("Failed to load wishlist. Please try again.");
      }
    };
    if (customerId) {
      fetchWishlist();
    } else {
      setError("Please log in to view your wishlist.");
    }
  }, [customerId]);

  // Delete wishlist item
  const handleDelete = async (wishlistId) => {
    try {
      await axios.delete(`/api/wishlistdisplay/${wishlistId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== wishlistId));
      setError(null);
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleWishClick = (productId) => {
    navigate(`/Product_details`, { state: { productId } });
  };

  const BACKEND_URL = `https://${window.location.hostname}:3000`;

  // Calculate discounted price safely
  const calculateDiscountedPrice = (price, discount) => {
    if (typeof discount !== "number") return price.toFixed(2);
    return (price - (price * discount) / 100).toFixed(2);
  };

  return (
    <div>
      <div className="wish-container">
        {error && <div className="error-message">{error}</div>}
        <div className="wish-tbl_content">
          <table className="wish-tbl">
            <thead>
              <tr>
                
                <th>Item description</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.length > 0 ? (
                wishlist.map((item) => (
                  <tr key={item._id}>
                    
                    <td
                      data-label="Item description"
                      onClick={() => handleWishClick(item.ProductID._id)}
                    >
                      {item.ProductID.ProductName}
                    </td>
                    <td
                      data-label="Price"
                      onClick={() => handleWishClick(item.ProductID._id)}
                    >
                     Rs.
                      {calculateDiscountedPrice(
                        item.ProductID.Price,
                        item.ProductID.Discount
                      )}
                    </td>
                    <td
                      data-label="Discount"
                      onClick={() => handleWishClick(item.ProductID._id)}
                    >
                      {typeof item.ProductID.Discount === "number"
                        ? `${item.ProductID.Discount}%`
                        : "N/A"}
                    </td>
                    <td data-label="Actions">
                      <button
                        className="wish-btn trash"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No items in your wish list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wish_list;