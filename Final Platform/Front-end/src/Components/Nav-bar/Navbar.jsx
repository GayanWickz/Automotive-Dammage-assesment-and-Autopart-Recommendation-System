import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Nav-bar.css";
import CarSearch from "../Carsearch/CarSearch"; // Import the CarSearch component

const Navbar = () => {
  const [manu, set_manue] = useState("Home");
  const [menuOpen, set_menu_open] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showCarSearch, setShowCarSearch] = useState(false); // State to control CarSearch visibility
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    setIsLoggedIn(false);
    setDropdownVisible(false);
    navigate("/");
  };

  const toggleCarSearch = () => {
    setShowCarSearch(!showCarSearch); // Toggle CarSearch visibility
  };

  return (
    <div className="Navbar">
      {/* Nav bar top section */}
      <div className="hedder-section">
        <div className="hedder">AutoPart Genius</div>
        <div className="hedder-right">
          <Link to="/Search">
            <img className="hedder-button" src="search-icon.png" alt="Search" />
          </Link>
          <div className="dropdown-container" onClick={toggleDropdown}>
            <img
              className="hedder-button"
              src="user-account.png"
              alt="Account"
            />
            {dropdownVisible && (
              <div className="dropdown-menu">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/Account"
                      onClick={() => setDropdownVisible(false)}
                    >
                      My Account
                    </Link>
                    <button className="logout-button" onClick={handleLogout}>
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/Login" onClick={() => setDropdownVisible(false)}>
                      Customer Account
                    </Link>
                    <Link
                      to="/Seller_login"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Seller Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link to="/Wish_list">
            <img className="hedder-button" src="wish-list.png" alt="Wishlist" />
          </Link>
          <Link to="/Cart">
            <img className="hedder-button" src="shopping-cart.png" alt="Cart" />
          </Link>
        </div>
      </div>

      <nav className="manu-section">
        {/* Nav bar responsive section */}
        <div
          className="menu-responsive"
          onClick={() => set_menu_open(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Nav bar menu section */}
              <ul className={menuOpen ? "open" : ""}>
     {/*      <li
            onClick={() => set_manue("Home")}
            className={manu === "Home" ? "active" : ""}
          >
            <NavLink to="/">HOME</NavLink>
          </li>
          <li
            onClick={() => set_manue("Men")}
            className={manu === "Men" ? "active" : ""}
          >
            <NavLink to="/Men">MEN</NavLink>
          </li>
          <li
            onClick={() => set_manue("Women")}
            className={manu === "Women" ? "active" : ""}
          >
            <NavLink to="/Women">WOMEN</NavLink>
          </li>
          <li
            onClick={() => set_manue("Offers")}
            className={manu === "Offers" ? "active" : ""}
          >
            <NavLink to="/Offers">OFFERS</NavLink>
          </li>
          <li
            onClick={() => set_manue("Hot")}
            className={manu === "Hot" ? "active" : ""}
          >
            <NavLink to="/Hot">HOT</NavLink>
          </li>
           */}
          {/* Add the "Search Auto Parts" button to the responsive menu */}
          <li className="responsive-search-button">
            <button className="green-shopping-button" onClick={toggleCarSearch}>
              Search Auto Parts
            </button>
          </li>
        </ul>
      </nav>

      {/* CarSearch Modal */}
      {showCarSearch && (
        <div className="car-search-modal">
          <div className="car-search-modal-content">
            <button className="close-button" onClick={toggleCarSearch}>
              &times;
            </button>
            <CarSearch />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;