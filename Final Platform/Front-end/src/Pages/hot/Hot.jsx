import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../../Components/category/category.css";
import "../../Components/category/category_page/category_page.css";



const Hot = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  // Fetch products from back-end
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://192.168.1.2:3000/api/productsdisplayhot${
            selectedCategory ? `?category=${selectedCategory}` : ""
          }`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5.3,
    slidesToScroll: 3,
    initialSlide: 0,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const handleCardClick = (productId) => {
    navigate(`/Product_details`, { state: { productId } });
  };

  return (
    <div>
      

      {/* Product Card Section */}
      <div className="grid-container">
        {products.length > 0 ? (
          products.map((product) => (
            <article
              className={`card ${product.Advertise === "Hot" ? "hot" : ""} ${
                product.Advertise === "Offers" ? "offers" : ""
              }`}
              key={product._id}
              onClick={() => handleCardClick(product._id)}
            >
              <div className="card-brand">
                {product.SellerID && product.SellerID.LogoImageFile ? (
                  <img
                    src={`https://192.168.1.2:3000/uploads/${product.SellerID.LogoImageFile}`}
                    alt={product.SellerID.SellerName || "Brand"}
                  />
                ) : (
                  <div className="placeholder-logo">No Logo</div>
                )}
                <div className="name">
                  <h4>{product.SellerID ? product.SellerID.SellerName : "Unknown Seller"}</h4>
                </div>
              </div>
              <div className="card-image">
                {product.ImageFile ? (
                  <img
                    src={`https://192.168.1.2:3000/uploads/${product.ImageFile}`}
                    alt={product.ProductName}
                  />
                ) : (
                  <div className="placeholder-image">Image not available</div>
                )}
              </div>
              <div className="card-info">
                <div className="name">
                  <h4>{product.ProductName || "Unnamed Product"}</h4>
                </div>
                <p>{product.ShortDescription || "No description available."}</p>
              </div>
              <div className="card-more">
                <div className="card-options">
                  <label>Price - </label>
                  <label>
                    Rs.{product.Price ? (product.Price - (product.Price * (product.Discount || 0)) / 100).toFixed(2) : "N/A"}
                  </label>
                </div>
                <div className="buttons">
                  <button className="card-wish-button">
                    <img className="card-wish-img" src="wish-list.png" alt="wishlist" />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="no-products-message">No products available.</p>
        )}
      </div>
    </div>
  );
};

export default Hot;
