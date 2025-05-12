import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Nav-bar.css";
import "../../Pages/search_page/search_page.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showCarSearch, setShowCarSearch] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    // Remove the token and customerId from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    setIsLoggedIn(false);
    setDropdownVisible(false);
    navigate("/");
  };

  const toggleCarSearch = () => {
    setShowCarSearch(!showCarSearch); 
  };
  const BACKEND_URL = `https://${window.location.hostname}`;
  return (
    <div className="navbar">
    
      <div className="navbar-top">
     
        <a href="" className="navbar-brand-link">
        <div className="navbar-brand">
  <img src="\public\logoo-removebg-preview.png" alt="AutoPart Genius Logo" className="navbar-logo" />
</div>
        </a>
        {/* Navbar menu section */}
        <nav className="navbar-menu">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`menu-items ${menuOpen ? "open" : ""}`}>
            <li>
              <NavLink to="/" className="menu-item-with-icon">
                
                HOME
              </NavLink>
            </li>
            <li>
              <NavLink to="/Offers" className="menu-item-with-icon">
                
                OFFERS
              </NavLink>
            </li>
            <li>
              <NavLink to="/Hot" className="menu-item-with-icon">
              
                HOT
              </NavLink>
            </li>
            <li>
              <NavLink to="/Wish_list" className="menu-item-with-icon">
                <img src="wish-list.png" alt="Wishlist" className="menu-icon" />
                WISHLIST
              </NavLink>
            </li>
            <li>
              <NavLink to="/Cart" className="menu-item-with-icon">
                <img src="shopping-cart.png" alt="Cart" className="menu-icon" />
                CART
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="navbar-icons">
          <div className="dropdown-container">
            <button className="icon-button" onClick={toggleDropdown}>
              <img src="user-account.png" alt="Account" />
            </button>
            {dropdownVisible && (
              <div className="dropdown-menu">
                {isLoggedIn ? (
                  <>
                    <Link to="/Account" onClick={() => setDropdownVisible(false)}>
                      My Account
                    </Link>
                    <button className="logout-button" onClick={handleLogout}>
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/Login" onClick={() => setDropdownVisible(false)}>
                      Customer
                    </Link>
                    <Link
                      to="/Seller_login"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Seller
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;