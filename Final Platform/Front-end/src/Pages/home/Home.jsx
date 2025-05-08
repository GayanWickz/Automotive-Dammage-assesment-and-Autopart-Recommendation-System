import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./home.css";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const handleAISearchClick = () => {
    setShowAISearchModal(true);
    setAiError("");
    setSelectedImage(null);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setUploading(true);
      const response = await axios.post(
        "https://192.168.137.1:5000/ai-search?image",
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://192.168.137.1:3000/api/productsdisplay${
            selectedVehicleBrand ? `?vehicleBrand=${selectedVehicleBrand}` : ""
          }`
        );
        setProducts(response.data);
        setFilteredProducts(response.data);
        setProductsToFilter(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (!searchQuery && !showAdvanced) fetchProducts();
  }, [selectedVehicleBrand, searchQuery, showAdvanced]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setSimilarItems([]);
        setProductsToFilter(products);
        return;
      }

      try {
        const endpoint = searchQuery.startsWith("PN-") ? "searchPartNumber" : "search";

        const response = await axios.get(
          `https://192.168.137.1:3000/api/productssearch/${endpoint}`,
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
            setProductsToFilter(response.data);
            setSimilarItems([]);
          } else {
            setSearchResults([]);
            setProductsToFilter([]);
            setSimilarItems([]);
          }
        } else {
          setSearchResults(response.data);
          setProductsToFilter(response.data);
          if (response.data.length === 0) {
            const similarResponse = await axios.get(
              `https://192.168.137.1:3000/api/productssearch/search`,
              {
                params: {
                  query: searchQuery,
                  vehicleBrand: selectedVehicleBrand,
                  suggest: true,
                },
              }
            );
            setSimilarItems(similarResponse.data);
            setProductsToFilter(similarResponse.data);
          } else {
            setSimilarItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
        setSimilarItems([]);
        setProductsToFilter([]);
      }
    };

    if (!showAdvanced) fetchSearchResults();
  }, [searchQuery, showAdvanced, selectedVehicleBrand, products]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...productsToFilter];
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const handleAdvancedSearch = async () => {
    try {
      const response = await axios.get(
        `https://192.168.137.1:3000/api/productssearch/advanced-vehicle-search`,
        {
          params: {
            make: vehicleMake,
            model: vehicleModel,
            year: modelYear,
          },
        }
      );

      const vehicleResults = response.data.filter(
        (item) => item.ProductType === "Vehicle" && item.VehicleBrand && item.Year
      );

      setSearchResults(vehicleResults);
      setProductsToFilter(vehicleResults);

      if (vehicleResults.length === 0) {
        alert("No matching vehicles found. Try expanding your search criteria.");
      }
    } catch (error) {
      console.error("Advanced search error:", error);
      alert("Error performing search. Please try again.");
      setSearchResults([]);
      setProductsToFilter([]);
    }
  };

  const heroContent = [
    {
      h4: "Auto Innovation Sale",
      h1: "Smart Automotive Solutions",
      p: "UPGRADE YOUR DRIVING EXPERIENCE",
      image: "car-slider-1.jpg",
    },
    {
      h4: "Advanced Detection Tech",
      h1: "Next-Gen Safety Systems",
      p: "DRIVE WITH CONFIDENCE AND PRECISION",
      image: "car-slider-2.jpg",
    },
    {
      h4: "Explore Premium Vehicles",
      h1: "Luxury Cars & Parts",
      p: "DISCOVER TOP-TIER AUTOMOTIVE EXCELLENCE",
      image: "car-slider-3.jpg",
    },
  ];

  const smallImages = [
    "admin-bg.jpg",
    "car-parts-auto-spare-isolated-600nw-2283939101.jpg",
    "istockphoto-478107962-612x612.jpg",
    "toyota-CHR-1536x640-1.jpg",
    "car-wreckers-huntly-3.jpg",
    "2021_toyota_service__parts_-_3.jpg",
    "IMG_2523.jpg",
    "TOYOTA_Land-Cruiser-200---V8-2015_main.jpg",
  ];

  const formatPrice = (price) => {
    return price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const ProductCard = ({ product }) => {
    const sellerLocation = product.SellerID?.SellerLocation;
    const distance =
      sellerLocation && userLocation
        ? calculateDistance(sellerLocation.lat, sellerLocation.lng)
        : null;

    const openGoogleMaps = (e) => {
      e.stopPropagation(); // Prevent click from bubbling to product-card
      if (sellerLocation) {
        const googleMapsUrl = `https://www.google.com/maps?q=${sellerLocation.lat},${sellerLocation.lng}`;
        window.open(googleMapsUrl, '_blank'); // Open in new tab
      }
    };

    const handleCardClick = () => {
      navigate(`/Product_details`, { state: { productId: product._id } });
    };

    return (
      <article
        className="product-card"
        onClick={handleCardClick}
      >
        {product.Discount > 0 && (
          <div className="discount-badge">-{product.Discount}%</div>
        )}
        <div className="distance-indicator" onClick={openGoogleMaps}>
          <svg className="location-icon" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
          </svg>
          {loadingLocation ? (
            <span className="location-loading">🌐 Locating...</span>
          ) : userLocation ? (
            <span className="distance">
              {distance ? (
                <>
                  {Math.round(distance)}
                  
                  km
                </>
              ) : (
                "N/A"
              )}
            </span>
          ) : (
            <span className="location-off"> Location Off</span>
          )}
        </div>
        <div className="product-card-brand">
          {product.SellerID?.LogoImageFile && (
            <img
              src={`https://192.168.137.1:3000/uploads/${product.SellerID.LogoImageFile}`}
              alt="brand"
              className="product-brand-logo"
            />
          )}
        </div>
        <img
          src={`https://192.168.137.1:3000/uploads/${product.ImageFiles[0]}`}
          alt={product.ProductName}
          className="product-image"
        />
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
              Rs.{formatPrice(product.Price * (1 - product.Discount / 100))}
            </span>
            {product.Discount > 0 && (
              <span className="original-price">
                Rs.{formatPrice(product.Price)}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  const FilterPanel = () => (
    <div className="filter-panel">
      <div className="filter-section filter-header">
        Filter Products
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
      <button
        className="mobile-filter-btn"
        onClick={() => setShowMobileFilters(true)}
      >
        Filters
      </button>
      <div
        className={`filter-overlay ${showMobileFilters ? "active" : ""}`}
        onClick={() => setShowMobileFilters(false)}
      />
      <div
        className={`mobile-filter-panel ${showMobileFilters ? "active" : ""}`}
      >
        <div className="filter-panel">
          <button
            className="filter-close"
            onClick={() => setShowMobileFilters(false)}
          >
            ×
          </button>
          <FilterPanel />
        </div>
      </div>
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
              type="button"
              className={`voice-button ${isListening ? "listening" : ""}`}
              onClick={toggleVoiceSearch}
            >
              <svg className="voice-icon" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
              </svg>
            </button>
            <button
              type="button"
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
      <section className="hero-slider">
        <div className="hero-grid">
          <div className="small-images-grid">
            {smallImages.map((image, index) => (
              <div key={index} className="small-image-wrapper">
                <img
                  src={image}
                  alt={`Vehicle ${index + 1}`}
                  className="small-image"
                />
              </div>
            ))}
          </div>
          <div className="main-slider">
            {heroContent.map((content, index) => (
              <div
                key={index}
                className={`slider-item ${index === activeHeroIndex ? "active" : ""}`}
              >
                <img
                  src={content.image}
                  alt={`Slide ${index + 1}`}
                  className="main-slider-image"
                />
                <div className="slider-overlay">
                  <div className="slider-text">
                    <h4 className="text-hili">{content.h4}</h4>
                    <h1>{content.h1}</h1>
                    <p>{content.p}</p>
                    <button className="section-image-button">
                      <Link to="/Offers">Shop Now</Link>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="slider-dots">
              {heroContent.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === activeHeroIndex ? "active" : ""}`}
                  onClick={() => setActiveHeroIndex(index)}
                />
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

      {showAISearchModal && (
        <div className="ai-search-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowAISearchModal(false)}
            >
              ×
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

const StarRating = ({ rating = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={`star ${index < rating ? "filled" : ""}`}>
      ★
    </span>
  ));
  return <div className="star-rating">{stars}</div>;
};

export default Home;