import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./home.css";

const vehicleBrands = [
  "Toyota",
  "Honda",
  "Ford",
  "BMW",
  "Mercedes",
  "Audi",
  "Hyundai",
  "Chevrolet",
  "Nissan",
];

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: 10000,
    categories: [],
    ratings: [],
    maxDistance: 100,
  });
  const navigate = useNavigate();

  // Geolocation setup
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLoadingLocation(false);
          },
          (error) => {
            setLocationError("Location access denied");
            setLoadingLocation(false);
          }
        );
      } else {
        setLocationError("Geolocation not supported");
      }
    };
    getLocation();
  }, []);

  // Distance calculation function
  const calculateDistance = (sellerLat, sellerLng) => {
    if (!userLocation) return null;
    
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(sellerLat - userLocation.lat);
    const dLng = toRad(sellerLng - userLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.lat)) *
      Math.cos(toRad(sellerLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  

  // Product Card Component
  const ProductCard = ({ product }) => {
    const sellerLocation = product.SellerID?.SellerLocation;
    const distance = sellerLocation && userLocation 
      ? calculateDistance(sellerLocation.lat, sellerLocation.lng)
      : null;
  // Debug logging
  console.log('Product:', product.ProductName);
  console.log('Seller Location:', sellerLocation);
  console.log('User Location:', userLocation);
    return (
      <article 
        className="product-card" 
        onClick={() => navigate(`/Product_details`, { state: { productId: product._id } })}
      >
        {product.Discount > 0 && (
          <div className="discount-badge">-{product.Discount}%</div>
        )}

        <div className="distance-indicator">
          {loadingLocation ? (
            <span className="location-loading">🌐 Locating...</span>
          ) : userLocation ? (
            <span className="distance">
              📍 {distance ? `${Math.round(distance)}km` : 'N/A'}
            </span>
          ) : (
            <span className="location-off">📍 Location Off</span>
          )}
        </div>

        <div className="product-card-brand">
          {product.SellerID?.LogoImageFile && (
            <img
              src={`http://localhost:3000/uploads/${product.SellerID.LogoImageFile}`}
              alt="brand"
              className="product-brand-logo"
            />
          )}
        </div>

        <img
          src={`http://localhost:3000/uploads/${product.ImageFile}`}
          alt={product.ProductName}
          className="product-image"
        />

        <div className="product-details">
          <div className="product-meta">
            <span className="sku">SKU: {product.SKU}</span>
            <div className="rating-container">
              <StarRating rating={product.Rating} />
              <span className="review-count">
                ({product.Reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          <h3 className="product-title">{product.ProductName}</h3>

          <div className="price-container">
            <span className="current-price">
              ${(product.Price * (1 - product.Discount / 100)).toFixed(2)}
            </span>
            {product.Discount > 0 && (
              <span className="original-price">${product.Price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </article>
    );
  };

  // Filter Panel Component
  const FilterPanel = () => (
    <div className="filter-panel">
      <div className="filter-section">
        <h3>Filter Products</h3>
        <div className="price-filter">
          <label>Price Range: ${filters.priceRange}</label>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.priceRange}
            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Part Categories</h4>
        {["Exterior", "Interior", "Electrical", "Exhaust", "Suspension", "Brakes", "Transmission", "Engine"].map(
          (category) => (
            <label key={category} className="filter-option">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={(e) => handleCategoryFilter(category, e.target.checked)}
              />
              {category}
            </label>
          )
        )}
      </div>

      <div className="filter-section">
        <h4>Customer Rating</h4>
        {[5, 4, 3, 2, 1].map((rating) => (
          <label key={rating} className="filter-option">
            <input
              type="checkbox"
              checked={filters.ratings.includes(rating)}
              onChange={(e) => handleRatingFilter(rating, e.target.checked)}
            />
            <StarRating rating={rating} />
            <span className="rating-text">& Up</span>
          </label>
        ))}
      </div>

      {userLocation && (
      <div className="filter-section">
        <h4>Maximum Distance (km)</h4>
        <div className="distance-filter">
          <label>Within {filters.maxDistance}km</label>
          <input
            type="range"
            min="0"
            max="500"
            value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
          />
        </div>
      </div>
    )}
    </div>
  );

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5.3,
    slidesToScroll: 3,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="section-image home-bg1">
        <div className="section-image-left">
          <h4 className="text-hili">Discover the Joy of Shopping</h4>
          <h1>Unbeatable Offers Await You!</h1>
          <p>ELEVATE YOUR EVERYDAY WITH ESSENTIAL MATTERS</p>
          <button className="section-image-button">
            <Link to="/Offers">Shop Now</Link>
          </button>
        </div>
        <div className="section-image-right">
          <img
            className="section-image-img"
            src="photo-1493238792000-8113da705763-removebg-preview.png"
            alt="promotion"
          />
        </div>
      </section>

      {/* Brand Carousel */}
      <Slider {...sliderSettings}>
        {vehicleBrands.map((brand, idx) => (
          <div
            className={`category-slider ${selectedVehicleBrand === brand ? "active" : ""}`}
            key={idx}
            onClick={() => setSelectedVehicleBrand(prev => prev === brand ? null : brand)}
          >
            <div className="category-slider-item">
              <img
                src={`${brand.toLowerCase()}.jpg`}
                alt={brand}
                className="category-slider-item-img"
              />
            </div>
          </div>
        ))}
      </Slider>

      {/* Main Content Area */}
      <div className="content-wrapper">
        <FilterPanel />
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Info Section */}
      <section className="section2">
        <div className="section2-card">
          <img className="section2-img" src="section2-main-bg.png" alt="about" />
          <div className="section2-dis">
            <h4 className="section2-dis-head text-hili">The Essence of Thoughtful Living</h4>
            <p className="section2-dis-text">
              In today’s world, making mindful choices is more important than ever. 
              Our platform celebrates the perfect blend of art, functionality, and 
              responsibility through curated products designed with care.
            </p>
            <ul className="section2-dis-li">
              <li>Quality materials and thoughtful packaging</li>
              <li>Supporting local businesses and ethical practices</li>
              <li>Minimalist designs for modern lifestyles</li>
              <li>Focus on reducing environmental impact</li>
              <li>Encouraging responsible consumerism</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;