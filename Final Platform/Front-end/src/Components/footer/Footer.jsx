import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <p>© 2025 AutoPart Genius. All rights reserved.</p>
          <Link to="/Policy" className="footer-policy-link">Policy</Link>
        </div>
        <div className="footer-right">
          <div className="social-media-links">
            <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="https://192.168.137.1:5173/public\transparent-google-logo-iconic-google-logo-with-blue-green-and-1710875585209.png" alt="Google" className="social-icon" />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="https://192.168.137.1:5173/public\Facebook_Logo_2023.png" alt="Facebook" className="social-icon" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="https://192.168.137.1:5173/public\free-youtube-logo-icon-2431-thumb.png" alt="YouTube" className="social-icon" />
            </a>
          </div>
          <Link to="/Contact">
            <button className="footer-contact-button">Contact</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;