import React from "react";
import { Route, Routes } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import Navbar from "./Components/Nav-bar/Navbar";
import Home from "./Pages/home/Home";
import Offers from "./Pages/offers/Offers";
import Hot from "./Pages/hot/Hot";
import Wish_list from "./Pages/wish_list/Wish_list";
import Footer from "./Components/footer/Footer";
import CarSearch from "./Components/Carsearch/CarSearch";
import Cart from "./Pages/cart/Cart";
import Account from "./Pages/account/Account";
import Contact from "./Pages/contact/Contact";
import Product_details from "./Pages/product_details/Product_details";
import Seller_nav from "./Components/seller_components/seller_nav-bar/Seller_nav";
import Add_product from "./Pages/seller/add_product/Add_product";
import Seller_home from "./Pages/seller/seller_home/Seller_home";
import Chat from "./Pages/seller/chat/Chat";
import New_orders from "./Pages/seller/new_orders/New_orders";
import Summary from "./Pages/seller/Analyzed Report/Summary";
import Delivered from "./Pages/seller/delivered/Delivered";
import Seller_profile from "./Pages/seller/seller_profile/Seller_profile";
import Seller_signup from "./Pages/seller/seller_signup/Seller_signup";
import Seller_login from "./Pages/seller/seller_login/Seller_login";
import Signup from "./Pages/signup/Signup";
import Login from "./Pages/login/Login";
import EditProduct from "./Pages/seller/edit_product/Edit_product";
import Admin_login from "./Pages/Admin/Admin_Login";
import Admin from "./Pages/Admin/Admin";
import SellerDetail from './Pages/Admin/SellerDetails'; 
import CustomerDetail from './Pages/Admin/CustomerDetails'; 
import Admincontact from './Pages/Admin/Admin_Notification'; 
import CustomerOrder from './Pages/Admin/Customer_Order_Details'; 
import Review from "./Pages/review/review";
import ResetPassword from "./Pages/login/ResetPassword";
import SellerResetPassword from "./Pages/seller/seller_login/SellerResetPassword";
const App = () => {
  return (
    <div className="App">
      <LoadScript googleMapsApiKey="AIzaSyB6MyHuGbmEQ1DevrMLF-E-Kfk6v7KIWjw">
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
            <Route key={path} path={path} element={<Navbar />} />
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
            <Route key={path} path={path} element={<Seller_nav />} />
          ))}
        </Routes>
        {/* Pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Offers" element={<Offers />} />
          <Route path="/Hot" element={<Hot />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Wish_list" element={<Wish_list />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Seller_login" element={<Seller_login />} />
          <Route path="/Seller_signup" element={<Seller_signup />} />
          <Route path="/Customer_login" element={<Login />} />
          <Route path="/Product_details" element={<Product_details />} />
          <Route path="/Add_product" element={<Add_product />} />
          <Route path="/Seller_home" element={<Seller_home />} />
          <Route path="/Chat" element={<Chat />} />
          <Route path="/New_orders" element={<New_orders />} />
          <Route path="/Summary" element={<Summary />} />
          <Route path="/Delivered" element={<Delivered />} />
          <Route path="/Seller_profile" element={<Seller_profile />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/editproduct" element={<EditProduct />} />
          <Route path="/Admin/Admin_Login" element={<Admin_login />} /> 
          <Route path="/Admin/Admin" element={<Admin />} /> 
          <Route path="/Admin/SellerDetails" element={<SellerDetail />} /> 
          <Route path="/Admin/CustomerDetails" element={<CustomerDetail />} /> 
          <Route path="/Admin/Admin_Notification" element={<Admincontact />} />
          <Route path="/Admin/Customer_Order_Details" element={<CustomerOrder />} />
          <Route path="/Carsearch/CarSearch" element={<CarSearch />} />
          <Route path="/Review" element={<Review />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/seller-reset-password/:token" element={<SellerResetPassword />} />
      
        </Routes>
        {/* Footer */}
        <Routes>
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
            "Summary",
            "Seller_profile",
            "editproduct",
          ].map((path) => (
            <Route key={path} path={path} element={<Footer />} />
          ))}
        </Routes>
      </LoadScript>
    </div>
  );
};

export default App;