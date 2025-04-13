import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-content">
        <p>© 2025 AutoPart Genius. All rights reserved.</p>
        <Link to="/Contact">
          <button className="footer-contact-button">Contact</button>
        </Link>
      </div>
    </div>
  );
};

export default Footer;