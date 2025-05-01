import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./home.css";
import MapPopup from "./MapPopup";

import "../search_page/search_page.css"; 
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
  const [similarItems, setSimilarItems] = useState([]);
  // Original States
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState(null);

  const [productsToFilter, setProductsToFilter] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: 100000000,
    categories: [],
    ratings: [],
    maxDistance: 500,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Search Functionality States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [modelYear, setModelYear] = useState("");

  // Search Functionality States (AI Search)
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Search Functionality States (AI Search)
  const handleAISearchClick = () => {
    setShowAISearchModal(true);
    setAiError("");
    setSelectedImage(null);
  };

  // Search Functionality States (AI Search)
  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setUploading(true);
      const response = await axios.post(
        "https://192.168.1.2:5000/ai-search?image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.class) {
        setSearchQuery(response.data.class);
        setShowAISearchModal(false);
      }
    } catch (error) {
      setAiError("Error analyzing image. Please try again.");
      console.error("AI Search error:", error);
    } finally {
      setUploading(false);
    }
  };

  const navigate = useNavigate();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  // Geolocation Setup
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
            setLoadingLocation(false);
          }
        );
      }
    };
    getLocation();
  }, []);

  // Product Fetching (Normal Browsing)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://192.168.1.2:3000/api/productsdisplay${
            selectedVehicleBrand ? `?vehicleBrand=${selectedVehicleBrand}` : ""
          }`
        );
        setProducts(response.data);
        setFilteredProducts(response.data);
        setProductsToFilter(response.data); // Set products to filter
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (!searchQuery && !showAdvanced) fetchProducts();
  }, [selectedVehicleBrand, searchQuery, showAdvanced]);

  // Search Fetching (Identical to SearchPage)
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setSimilarItems([]);
        setProductsToFilter(products); // Reset to original products when search is cleared
        return;
      }
  
      try {
        const endpoint = searchQuery.startsWith("PN-") ? "searchPartNumber" : "search";
  
        const response = await axios.get(
          `https://192.168.1.2:3000/api/productssearch/${endpoint}`,
          {
            params: {
              query: searchQuery.startsWith("PN-") ? searchQuery.substring(3) : searchQuery,
              vehicleBrand: selectedVehicleBrand,
              suggest: true,
            },
          }
        );
  
        if (endpoint === "searchPartNumber") {
          if (response.data.length > 0) {
            setSearchResults(response.data);
            setProductsToFilter(response.data); // Update productsToFilter for part number search
            setSimilarItems([]);
          } else {
            setSearchResults([]);
            setProductsToFilter([]); // Clear productsToFilter if no results
            setSimilarItems([]);
          }
        } else {
          setSearchResults(response.data);
          setProductsToFilter(response.data); // Update productsToFilter for normal search
          if (response.data.length === 0) {
            const similarResponse = await axios.get(
              `https://192.168.1.2:3000/api/productssearch/search`,
              {
                params: {
                  query: searchQuery,
                  vehicleBrand: selectedVehicleBrand,
                  suggest: true,
                },
              }
            );
            setSimilarItems(similarResponse.data);
            setProductsToFilter(similarResponse.data); // Update productsToFilter for similar items
          } else {
            setSimilarItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
        setSimilarItems([]);
        setProductsToFilter([]); // Clear productsToFilter on error
      }
    };
  
    if (!showAdvanced) fetchSearchResults();
  }, [searchQuery, showAdvanced, selectedVehicleBrand, products]);
  // Filters Application (For Normal Browsing)
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...productsToFilter]; // Filter productsToFilter
      filtered = filtered.filter((product) => product.Price <= filters.priceRange);
      if (filters.categories.length > 0) {
        filtered = filtered.filter((product) =>
          filters.categories.includes(product.PartCategory)
        );
      }
      if (filters.ratings.length > 0) {
        filtered = filtered.filter((product) =>
          filters.ratings.some((rating) => product.SellerID?.averageRating >= rating)
        );
      }
      if (userLocation && filters.maxDistance > 0) {
        filtered = filtered.filter((product) => {
          const sellerLocation = product.SellerID?.SellerLocation;
          if (!sellerLocation) return false;
          const distance = calculateDistance(sellerLocation.lat, sellerLocation.lng);
          return distance <= filters.maxDistance;
        });
      }
      setFilteredProducts(filtered);
    };
    applyFilters();
  }, [filters, productsToFilter, userLocation]);

  // Voice Search Handlers
  const toggleVoiceSearch = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setSearchQuery(transcript);
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setIsListening(false);
  };

  // Advanced Search Handler (Separate from Normal Search)
  const handleAdvancedSearch = async () => {
    try {
      const response = await axios.get(
        `https://192.168.1.2:3000/api/productssearch/advanced-vehicle-search`,
        {
          params: {
            make: vehicleMake,
            model: vehicleModel,
            year: modelYear,
          },
        }
      );
  
      // Filter only valid vehicle results
      const vehicleResults = response.data.filter(
        (item) => item.ProductType === "Vehicle" && item.VehicleBrand && item.Year
      );
  
      setSearchResults(vehicleResults);
      setProductsToFilter(vehicleResults); // Update productsToFilter for advanced search
  
      if (vehicleResults.length === 0) {
        alert("No matching vehicles found. Try expanding your search criteria.");
      }
    } catch (error) {
      console.error("Advanced search error:", error);
      alert("Error performing search. Please try again.");
      setSearchResults([]);
      setProductsToFilter([]); // Clear productsToFilter on error
    }
  };

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Add this effect with your other useEffect hooks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % 3); // Cycle through 3 slides
    }, 5000); // 5 seconds per slide
  
    return () => clearInterval(interval);
  }, []);

  // Add this array near the top of your component
  const heroContent = [
    {
      h4: "Discover the Joy of Shopping",
      h1: "Unbeatable Offers Await You!",
      p: "ELEVATE YOUR EVERYDAY WITH ESSENTIAL MATTERS",
    },
    {
      h4: "Auto Innovation Sale",
      h1: "Smart Automotive Solutions",
      p: "UPGRADE YOUR DRIVING EXPERIENCE",
    },
    {
      h4: "Advanced Detection Tech",
      h1: "Next-Gen Safety Systems",
      p: "DRIVE WITH CONFIDENCE AND PRECISION",
    },
  ];

  // Product Card Component
  const ProductCard = ({ product }) => {
    const [showMap, setShowMap] = useState(false);
    const sellerLocation = product.SellerID?.SellerLocation;
    const distance =
      sellerLocation && userLocation
        ? calculateDistance(sellerLocation.lat, sellerLocation.lng)
        : null;
  
    // Toggle map visibility
    const toggleMap = (e) => {
      e.stopPropagation();
      setShowMap((prev) => !prev);
    };
  
    return (
      <article
        className="product-card"
        onClick={() =>
          navigate(`/Product_details`, { state: { productId: product._id } })
        }
      >
        {/* Discount Badge */}
        {product.Discount > 0 && (
          <div className="discount-badge">-{product.Discount}%</div>
        )}
  
        {/* Distance Indicator */}
        <div className="distance-indicator" onClick={toggleMap}>
          {loadingLocation ? (
            <span className="location-loading">🌐 Locating...</span>
          ) : userLocation ? (
            <span className="distance">
              📍 {distance ? `${Math.round(distance)}km` : "N/A"}
            </span>
          ) : (
            <span className="location-off">📍 Location Off</span>
          )}
        </div>
  
        {/* Seller Logo */}
        <div className="product-card-brand">
          {product.SellerID?.LogoImageFile && (
            <img
              src={`https://192.168.1.2:3000/uploads/${product.SellerID.LogoImageFile}`}
              alt="brand"
              className="product-brand-logo"
            />
          )}
        </div>
  
        {/* Product Image */}
        <img
          src={`https://192.168.1.2:3000/uploads/${product.ImageFiles[0]}`}
          alt={product.ProductName}
          className="product-image"
        />
  
        {/* Product Details */}
        <div className="product-detailss">
          <div className="product-meta">
            <span className="sku">Rating: {product.SKU}</span>
            <div className="rating-container">
              <StarRating rating={product.SellerID?.averageRating || 0} />
              <span className="review-count">
                ({product.SellerID?.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
  
          <h3 className="product-title">{product.ProductName}</h3>
  
          <div className="price-container">
            <span className="current-price">
              Rs.{(product.Price * (1 - product.Discount / 100)).toFixed(2)}
            </span>
            {product.Discount > 0 && (
              <span className="original-price">
                Rs.{product.Price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
  
        {/* Map Popup */}
        {showMap && sellerLocation && userLocation && (
          <MapPopup
            userLocation={userLocation}
            sellerLocation={sellerLocation}
            onClose={() => setShowMap(false)}
          />
        )}
      </article>
    );
  };

  
  // Filter Panel Component
const FilterPanel = () => (
  <div className="filter-panel">
    <div className="filter-section filter-header">
      <h3>
        <span className="filter-icon">🛠️</span> Filter Products
      </h3>
    </div>

    <div className="filter-section price-section">
      <h4>Price Range</h4>
      <div className="price-filter">
        <label>Up to Rs.{filters.priceRange.toLocaleString()}</label>
        <input
          type="range"
          min="0"
          max="100000000"
          value={filters.priceRange}
          onChange={(e) =>
            setFilters({ ...filters, priceRange: e.target.value })
          }
        />
      </div>
    </div>

    <div className="filter-section category-section">
      <h4>Part Categories</h4>
      {[
        "Exterior",
        "Interior",
        "Electrical",
        "Exhaust",
        "Suspension",
        "Brakes",
        "Transmission",
        "Engine",
      ].map((category) => (
        <label key={category} className="filter-option category-option">
          <input
            type="checkbox"
            checked={filters.categories.includes(category)}
            onChange={(e) => handleCategoryFilter(category, e.target.checked)}
          />
          <span className="category-label">{category}</span>
        </label>
      ))}
    </div>

    <div className="filter-section rating-section">
      <h4>Customer Rating</h4>
      {[5, 4, 3, 2, 1].map((rating) => (
        <label key={rating} className="filter-option rating-option">
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
      <div className="filter-section distance-section">
        <h4>Maximum Distance</h4>
        <div className="distance-filter">
          <label>Within {filters.maxDistance} km</label>
          <input
            type="range"
            min="0"
            max="500"
            value={filters.maxDistance}
            onChange={(e) =>
              setFilters({ ...filters, maxDistance: e.target.value })
            }
          />
        </div>
      </div>
    )}
  </div>
);

  // Helper Functions
  const calculateDistance = (sellerLat, sellerLng) => {
    if (!userLocation) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
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

  const handleCategoryFilter = (category, checked) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  const handleRatingFilter = (rating, checked) => {
    setFilters((prev) => ({
      ...prev,
      ratings: checked
        ? [...prev.ratings, rating]
        : prev.ratings.filter((r) => r !== rating),
    }));
  };

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
      {/* Mobile Filter Button */}
      <button
        className="mobile-filter-btn"
        onClick={() => setShowMobileFilters(true)}
      >
        Filters
      </button>

      {/* Mobile Filter Overlay */}
      <div
        className={`filter-overlay ${showMobileFilters ? "active" : ""}`}
        onClick={() => setShowMobileFilters(false)}
      />

      {/* Mobile Filter Panel */}
      <div
        className={`mobile-filter-panel ${showMobileFilters ? "active" : ""}`}
      >
        <div className="filter-panel">
          <button
            className="filter-close"
            onClick={() => setShowMobileFilters(false)}
          >
            &times;
          </button>
          <FilterPanel />
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-search-container">
        <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
          <div className="input-container">
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search products or part numbers..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="buttond"
              className={`voice-button ${isListening ? "listening" : ""}`}
              onClick={toggleVoiceSearch}
            >
              <svg className="voice-icon" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
              </svg>
            </button>

            <button
              type="buttond"
              className="ai-search-button"
              onClick={handleAISearchClick}
            >
              <img
                src="file.svg"
                alt="AI Search"
                className="ai-icon"
                style={{ height: "30px", width: "50px" }}
              />
            </button>
          </div>
        </form>
      </div>
      
      {/* Hero Section */}
      <section className="section-image home-bg1">
        <div className="section-image-left">
          {heroContent.map((content, index) => (
            <div
              key={index}
              className={`text-content ${
                index === activeHeroIndex ? "active" : ""
              }`}
            >
              <h4 className="text-hili">{content.h4}</h4>
              <h1>{content.h1}</h1>
              <p>{content.p}</p>
              {index === activeHeroIndex && (
                <button className="section-image-button">
                  <Link to="/Offers">Shop Now</Link>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="section-image-right">
          <div className="image-slider-container">
            <div className="slider-track">
              {heroContent.map((_, index) => (
                <div
                  key={index}
                  className="slider-item"
                  style={{ opacity: index === activeHeroIndex ? 1 : 0 }}
                >
                  <img
                    className="section-image-img"
                    src={
                      [
                        "photo-1493238792000-8113da705763-removebg-preview.png",
                        "automotive-software-development.jpg",

                        "car-detection-blog-cr-1024x576 (1).jpg",
                      ][index]
                    }
                    alt={`promotion ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="glass-search-container">
        <div className="advanced-search-section">
          <button
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "▲ Hide Vehicle Search" : "▼ Vehicle Search"}
          </button>

          {showAdvanced && (
            <div className="advanced-fields">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Vehicle Make (e.g., Toyota)"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Vehicle Model (e.g., Camry)"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Model Year (e.g., 2020)"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value)}
                />
              </div>
              <button onClick={handleAdvancedSearch}>Search Vehicles</button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}

      {/* Brand Carousel */}
      <Slider {...sliderSettings}>
        {vehicleBrands.map((brand, idx) => (
          <div
            className={`category-slider ${
              selectedVehicleBrand === brand ? "active" : ""
            }`}
            key={idx}
            onClick={() =>
              setSelectedVehicleBrand((prev) => (prev === brand ? null : brand))
            }
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
        <div className="desktop-filter-panel">
          <FilterPanel />
        </div>

        <div className="product-grid">
  {searchQuery || showAdvanced ? (
    filteredProducts.length > 0 ? (
      filteredProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))
    ) : (
      <div className="no-results">
        <p>No results found for "{searchQuery}"</p>
        <div className="search-tips">
          <p>Search tips:</p>
          <ul>
            <li>Try different keywords</li>
            <li>Check your spelling</li>
            <li>Use more general terms</li>
          </ul>
        </div>
        <button
          onClick={() => setSearchQuery("")}
          className="clear-search-button"
        >
          Clear search
        </button>
      </div>
    )
  ) : (
    filteredProducts.map((product) => (
      <ProductCard key={product._id} product={product} />
    ))
  )}
</div>
      </div>

      {/* Info Section */}
      <section className="section2">
        <h4 className="section2-dis-head text-hili">
          Redefining Smart Auto Commerce
        </h4>
        <div className="section2-card">
          <img
            className="section2-img"
            src="pngtree-automotive-technology-background-image_2371302.jpg"
            alt="about"
          />
          <div className="section2-dis">
            <p className="section2-dis-text">
              In a world driven by innovation, our platform brings thoughtful
              living into the realm of vehicle ownership and repair. By
              combining machine learning with responsible e-commerce practices,
              we make vehicle part identification smarter, shopping easier and
              decisions more mindful.
            </p>
            <ul className="section2-dis-li">
              <li>🚘 AI-Driven Image Recognition-:</li>
              <li>📦 Minimalist, Functional Design</li>
              <li>🛒 Curated Product Matching</li>
              <li>♻️ Encouraging Sustainable Repair</li>
              <li>Support for Local Vendors</li>
            </ul>
          </div>
        </div>
      </section>

      {showAISearchModal && (
        <div className="ai-search-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowAISearchModal(false)}
            >
              &times;
            </button>
            <h3>Vehicle Image Search</h3>
            <p className="upload-instruction">
              Upload front view of the vehicle
            </p>

            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                id="ai-image-upload"
                hidden
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
              <label htmlFor="ai-image-upload" className="upload-label">
                {selectedImage ? (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <span>Click to select image</span>
                  </div>
                )}
              </label>
            </div>

            {aiError && <p className="error-message">{aiError}</p>}

            <button
              className="upload-button"
              onClick={handleImageUpload}
              disabled={!selectedImage || uploading}
            >
              {uploading ? "Analyzing..." : "Search Vehicle"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={`star ${index < rating ? "filled" : ""}`}>
      ★
    </span>
  ));
  return <div className="star-rating">{stars}</div>;
};

export default Home;