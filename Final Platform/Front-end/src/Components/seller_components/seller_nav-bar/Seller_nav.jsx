import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Seller-nav.css";

const Seller_nav = () => {
  const [manu, set_manue] = useState("Seller_home");
  const [menuOpen, set_menu_open] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        set_menu_open(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("sellertoken");
    setIsLoggedIn(!!token);
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("sellertoken");
    localStorage.removeItem("sellerId");
    setIsLoggedIn(false);
    setDropdownVisible(false);
    navigate("../");
  };

  const closeMenu = () => {
    if (isMobile) {
      set_menu_open(false);
    }
  };
  const handleLogoClick = () => {
    navigate("../"); // Navigate to the home page 
  };
  return (
    <div className="Navbar-cat">
      {/* Header Section */}
      <div className="hedder-section-cat">
      <div className="hedder-cat" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          AutoPart Genius
        </div>
        
        <div className="hedder-right-cat">
          {/* Mobile Menu Button */}
          <div 
            className={`menu-responsive-cat ${menuOpen ? "open" : ""}`} 
            onClick={() => set_menu_open(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          {/* Account Dropdown */}
          <div className="dropdown-container-cat" onClick={toggleDropdown}>
            <img
              className="hedder-button-cat"
              src="user-account.png"
              alt="Account"
            />
            {dropdownVisible && (
              <div className="dropdown-menu-cat">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/Seller_profile"
                      onClick={() => {
                        setDropdownVisible(false);
                        closeMenu();
                      }}
                    >
                      My Account
                    </Link>
                    <button className="logout-button-cat" onClick={handleLogout}>
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/Login" 
                      onClick={() => {
                        setDropdownVisible(false);
                        closeMenu();
                      }}
                    >
                      Customer Account
                    </Link>
                    <Link
                      to="/Seller_login"
                      onClick={() => {
                        setDropdownVisible(false);
                        closeMenu();
                      }}
                    >
                      Seller Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="manu-section-cat">
        <ul className={`menu-items-cat ${menuOpen ? "open" : ""}`}>
          <li
            onClick={() => {
              set_manue("Seller_home");
              closeMenu();
            }}
            className={manu === "Seller_home" ? "active" : ""}
          >
            <NavLink to="/Seller_home">HOME</NavLink>
          </li>
          <li
            onClick={() => {
              set_manue("Add_product");
              closeMenu();
            }}
            className={manu === "Add_product" ? "active" : ""}
          >
            <NavLink to="/Add_product">ADD PRODUCT</NavLink>
          </li>
          <li
            onClick={() => {
              set_manue("New_orders");
              closeMenu();
            }}
            className={manu === "New_orders" ? "active" : ""}
          >
            <NavLink to="/New_orders">NEW ORDERS</NavLink>
          </li>
          <li
            onClick={() => {
              set_manue("Delivered");
              closeMenu();
            }}
            className={manu === "Delivered" ? "active" : ""}
          >
            <NavLink to="/Delivered">DELIVERED</NavLink>
          </li>
          <li
            onClick={() => {
              set_manue("Chat");
              closeMenu();
            }}
            className={manu === "Chat" ? "active" : ""}
          >
            <NavLink to="/Chat">CHAT</NavLink>
          </li>
          <li
            onClick={() => {
              set_manue("Summary");
              closeMenu();
            }}
            className={manu === "Summary" ? "active" : ""}
          >
            <NavLink to="/Summary">Analyzed Report</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Seller_nav;