import React, { useState } from "react";
import axios from "axios";
import "./contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    } else if (formData.message.length > 100) {
      newErrors.message = "Message cannot exceed 100 characters.";
    }
    return newErrors;
  };

  

  return (
    <div>
      {/* Contact section */}
      <div className="contact-con">
        <div className="contact-left-side">
          <div className="contact-address details">
            <img className="contact-icon" src="pngtree-flat-red-location-sign-png-image_6553065.png" alt="" />
            <h4>Address</h4>
            <p>69/4 Main Street</p>
            <p>Malabe,Colombo 04</p>
          </div>
          <div className="contact-phone details">
            <img className="contact-icon" src="hd-green-round-circle-phone-icon-png-701751695059810shy4vi4gck.png" alt="" />
            <h4>Phone</h4>
            <p>+94 (77) 252-2466</p>
            <p>+94 (11) 765-4321</p>
          </div>
          <div className="contact-email details">
            <img className="contact-icon" src="hd-letter-email-round-blue-icon-transparent-png-70175169503463700jpjirgdw.png" alt="" />
            <h4>E-mail</h4>
            <p>support@example.com</p>
            <p>info@example.com</p>
          </div>
        </div>
        <div className="contact-right-side">
          <h3 className="text-hili">Send us a message</h3>
          <p>
            If you have any questions or need further information, feel free to
            reach out to us. We are happy to assist you with any inquiries or
            support requests you may have. Our team is dedicated to providing
            timely and efficient responses to all communications.
          </p>
          <form className="gap" onSubmit={handleSubmit}>
            <div className="contact-input-box">
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>
            <div className="contact-input-box">
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="contact-input-box message-box">
              <input
                name="message"
                placeholder="Message..."
                value={formData.message}
                onChange={handleChange}
              />
              <p className="char-count">
                {formData.message.length}/100 characters{" "}
                {errors.message && <p className="error">{errors.message}</p>}
              </p>
            </div>
            <button
              className="contact-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
            {apiError && <p className="error">{apiError}</p>}{" "}
            {/* Display API error */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
