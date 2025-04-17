import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./product_details.css";
import { Questionsm } from "../../Components/Modules/product_details_questions/Product_details_questions";
import Review from "../../Pages/review/review";


const Product_details = () => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 50) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 50) {
      setQuantity(value);
    } else if (value < 1) {
      setQuantity(1);
    } else if (value > 50) {
      setQuantity(50);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleButtonClick = (value) => {
    setModalOpen(false);
    setMessage(value);
  };

  const location = useLocation();
  const { productId } = location.state || {};
  const [product, setProduct] = useState(null);

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(
        `http://192.168.137.1:3000/api/productsdetailsdisplay/${productId}`
      );
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };
  const customerId = localStorage.getItem("customerId");
  console.log("CustomerID:", customerId);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId"); 
    
    // Check for both token and customerId
    if (!token || !customerId) {
      alert("Please login to add items to the cart.");
      return;
    }
  
  
  };




  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("new-question", (data) => {
      if (data?.productId === productId) {
        setQuestions((prevQuestions) => [data.question, ...prevQuestions]);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchQuestions();
    }
  }, [productId]);

  const [visibleQuestions, setVisibleQuestions] = useState(3);
  const showMoreQuestions = () => {
    setVisibleQuestions((prev) => prev + 3);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.ImageFiles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.ImageFiles.length - 1 : prevIndex - 1
    );
  };

// Add this new component above the VehicleDetails component
const SellerContactDetails = ({ seller }) => {
  if (!seller) return null;

  return (
    <div className="seller-contact">
      <h3 className="section-title">Seller Information</h3>
      <div className="specs-grid">
        <div className="spec-item">
          <span className="spec-label">Seller Name</span>
          <span className="spec-value">{seller.SellerName}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Contact Number</span>
          <span className="spec-value">{seller.SellerPhoneNumber}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Email</span>
          <span className="spec-value">{seller.SellerEmail}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Address</span>
          <span className="spec-value">{seller.SellerAddress}</span>
        </div>
      </div>
    </div>
  );
};

  const VehicleDetails = ({ product }) => (
    <div className="vehicle-details">
      <div className="product-specs">
        <h3 className="section-title">Vehicle Specifications</h3>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Vehicle Type</span>
            <span className="spec-value">{product.VehicleType}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Brand</span>
            <span className="spec-value">{product.VehicleBrand}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Model</span>
            <span className="spec-value">{product.VehicleModel}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Year</span>
            <span className="spec-value">{product.Year}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Mileage</span>
            <span className="spec-value">{product.Mileage} km</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Transmission</span>
            <span className="spec-value">{product.Transmission}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Fuel Type</span>
            <span className="spec-value">{product.FuelType}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Engine Capacity</span>
            <span className="spec-value">{product.EngineCapacity} cc</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PartDetails = ({ product }) => (
    <div className="part-details">
      <div className="product-specs">
        <h3 className="section-title">Part Details</h3>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Category</span>
            <span className="spec-value">{product.PartCategory}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Part Number</span>
            <span className="spec-value">{product.PartNumber}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Condition</span>
            <span className="spec-value">{product.PartCondition}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Stock Status</span>
            <span className="spec-value">{product.StockStatus}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Quantity Available</span>
            <span className="spec-value">{product.Quantity}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Compatible Brand</span>
            <span className="spec-value">{product.VehicleBrand}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Associated Vehicle</span>
            <span className="spec-value">{product.AssociatedVehicle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {product ? (
        <section className="product-details-con">
          <div className="product-details-image-con">
            <div className="image-slider">
              <button className="slider-button left" onClick={handlePrevImage}>
                &lt;
              </button>
              <img
                className="product-details-image"
                src={`http://192.168.137.1:3000/uploads/${product.ImageFiles[currentImageIndex]}`}
                alt={product.ProductName || "Product Image"}
              />
              <button className="slider-button right" onClick={handleNextImage}>
                &gt;
              </button>
            </div>
            {/* Review Component */}
          {product.SellerID && (
                        <div className="product-reviews">
                            <Review sellerId={product.SellerID} />
                        </div>
                    )}
          </div>
          <div className="product-details-details">
            <h3 className="text-hili">{product.ProductName}</h3>
            <h4>{product.ShortDescription}</h4>
            <p className="product-details-top">{product.LongDescription}</p>

              {/* Updated price display with conditional discount */}
      {product.Discount > 0 ? (
        <>
          <h4 className="product-details-top text-hili">
            Rs.{(product.Price - (product.Price * product.Discount) / 100).toFixed(2)}
          </h4>
          <h5 className="product-details-discount">Rs.{product.Price}</h5>
        </>
      ) : (
        <h4 className="product-details-top text-hili">Rs.{product.Price}</h4>
      )}

  {/* Conditional Details Render */}
  {product.ProductType === "Vehicle" ? (
              <VehicleDetails product={product} />
            ) : (
              <PartDetails product={product} />
            )}

{product.SellerID && (
            <SellerContactDetails seller={product.SellerID} />
          )}


{product.ProductType === "Part" && (
            <div className="product-details-stepper">
              <button
                className="product-details-stepper-button button-left"
                onClick={handleDecrement}
              >
                -
              </button>
              <input
                className="product-details-stepper-input"
                type="number"
                value={quantity}
                onChange={handleInputChange}
                min="1"
                max="50"
              />
              <button
                className="product-details-stepper-button button-right"
                onClick={handleIncrement}
              >
                +
              </button>
            </div>
            )}
            <div className="product-details-button">
              <button
                className="product-details-wish-button"
                onClick={handleAddToWishList}
              >
                <img
                  className="product-details-wish-img"
                  src="wish-list.png"
                  alt="Add to Wishlist"
                />
              </button>
              {product.ProductType === "Part" && (
                <button
                  className="product-details-cart-button"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </button>
              )}
            </div>
          </div>
          
        </section>
        
      ) : (
        <p>Loading product details...</p>
      )}

      {/* Chat Section */}
      <section className="product-chat-con">
        {Questions.length > 0 &&
          Questions.slice(0, visibleQuestions).map((question, index) => (
            <div key={question._id || index} className="product-chat">
              <p className="product-chat-lable-customer text-hili">
                <img
                  className="product-chat-image"
                  src="user-logo.png"
                  alt=""
                />
                {question.Question}
              </p>
              <p className="product-chat-lable-seller">
                {question.Answer}
                <img
                  className="product-chat-image"
                  src={
                    question.ProductID &&
                    question.ProductID.SellerID &&
                    question.ProductID.SellerID.LogoImageFile
                      ? `http://192.168.137.1:3000/uploads/${question.ProductID.SellerID.LogoImageFile}`
                      : "default-logo.png"
                  }
                  alt={
                    question.ProductID.SellerID.LogoImageFile || "Logo Image"
                  }
                />
              </p>
            </div>
          ))}
        {visibleQuestions < Questions.length && (
          <button
            className="product-chat-show-more-button"
            onClick={showMoreQuestions}
          >
            Show more
          </button>
        )}
        <button
          className="product-chat-input"
          onClick={() => setModalOpen(true)}
        >
          Ask questions
        </button>
        {modalOpen &&
          createPortal(
            <Questionsm
              closeModal={handleButtonClick}
              onSubmit={handleButtonClick}
              onCancel={handleButtonClick}
              productId={productId}
            ></Questionsm>,
            document.body
          )}
      </section>
    </div>
  );
};

export default Product_details;