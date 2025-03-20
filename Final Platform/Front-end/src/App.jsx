import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Nav-bar/Navbar";
import Home from "./Pages/home/Home";
import Footer from "./Components/footer/Footer";
import Account from "./Pages/account/Account";
import Signup from "./Pages/signup/Signup";
import Login from "./Pages/login/Login";


const App = () => {
  return (
    <div className="App">
      <Routes>
        {/* Customer nav bar */}
        {[
          "",
          "Men",
          "Women",
          "Offers",
          "Hot",
          "Contact",
          "Wish_list",
          "Cart",
          "Account",
          "Search",
          "Product_details",
        ].map((path) => (
          <Route path={path} element={<Navbar />} />
        ))}
        {/* Seller nav bar */}
        {[
          "Add_product",
          "Seller_home",
          "Chat",
          "New_orders",
          "Delivered",
          "Seller_profile",
          "editproduct",
        ].map((path) => (
          <Route path={path} element={<Seller_nav />} />
        ))}
      </Routes>
      {/* Pages */}
      <Routes>
      
        
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        
        <Route path="/Customer_login" element={<Login />} />
        
        
        
      </Routes>
      {/* Footer */}
      <Routes>
        {/* Customer nav bar */}
        {[
          "",
          "Men",
          "Women",
          "Offers",
          "Hot",
          "Contact",
          "Wish_list",
          "Cart",
          "Account",
          "Search",
          "Product_details",
          "Add_product",
          "Seller_home",
          "Chat",
          "New_orders",
          "Delivered",
          "Seller_profile",
          "editproduct",
        ].map((path) => (
          <Route path={path} element={<Footer />} />
        ))}
      </Routes>
    </div>
  );
};

export default App;
