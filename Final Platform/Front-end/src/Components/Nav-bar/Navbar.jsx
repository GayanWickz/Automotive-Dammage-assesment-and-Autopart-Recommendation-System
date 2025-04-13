import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Nav-bar.css";
import "../../Pages/search_page/search_page.css"; 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showCarSearch, setShowCarSearch] = useState(false); // State to control CarSearch visibility
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
    setShowCarSearch(!showCarSearch); // Toggle CarSearch visibility
  };

   




  return (
    <div className="navbar">
      {/* Navbar top section */}
      <div className="navbar-top">
        <div className="navbar-brand">AutoPart Genius</div>
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
            <NavLink to="/">HOME</NavLink>
          </li>
         
          <li>
            <NavLink to="/Offers">OFFERS</NavLink>
          </li>
          <li>
            <NavLink to="/Hot">HOT</NavLink>
          </li>
          
        </ul>
      </nav>
      <div>
        
      </div>
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
            <button className="icon-button">
              <img src="wish-list.png" alt="Wishlist" />
            </button>
          </Link>
          <Link to="/Cart">
            <button className="icon-button">
              <img src="shopping-cart.png" alt="Cart" />
            </button>
          </Link>
        
        </div>
        
      </div>

      
    
        
      
    
    </div>
  );
};

export default Navbar;