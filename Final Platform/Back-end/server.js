import cors from "cors";
import express from "express";
import https from "https";
import fs from "fs";
import { connectDB } from "./config/db.js";
import gmailController from "./models/gmailController.js";
import AdmincontactRouter from "./routes/Admin_contact_routes.js";
import PrivateRoute from "./routes/Admin_Login_Private.js";
import AskQuestionReply from "./routes/Ask_questions_reply_route.js";
import AskQuestionsRouter from "./routes/Ask_questions_routes.js";
import Customerdetails from "./routes/Customer_account_routes.js";
import CustomerAuthenticationRouter from "./routes/Customer_authentication_routes.js";
import Orderscustomer from "./routes/Customer_order_routes.js";
import router from "./routes/Customer_reply_delete_routes.js";
import Display from "./routes/Home_product_display_routes.js";
import DisplayHot from "./routes/Hot_product_display_routes.js";
import DisplayMen from "./routes/Men_product_display_routes.js";
import DisplayOffer from "./routes/Offer_product_display_routes.js";
import OrderRouter from "./routes/Order_routes.js";
import PendingCartRouter from "./routes/Pending_cart_routes.js";
import ECommerceRouter from "./routes/Product_add_routes.js";
import Productdetails from "./routes/Product_details_routes.js";
import Update from "./routes/Product_edit_routes.js";
import Search from "./routes/Search_routes.js";
import Sellerdetails from "./routes/Seller_account_routes.js";
import ProductDisplayRouter from "./routes/Seller_all_products_routes.js";
import SellerAuthenticationRouter from "./routes/Seller_authentication_routes.js";
import Delivered from "./routes/Seller_delivered_order_routes.js";
import Ordernew from "./routes/Seller_new_order_routes.js";
import Delete from "./routes/Seller_product_de_ed_routes.js";
import Questions from "./routes/Show_questions_routes.js";
import Reply from "./routes/Show_reply_routes.js";
import WishlistDisplay from "./routes/Wish_list_display_routes.js";
import WishlistRouter from "./routes/Wish_list_routes.js";
import DisplayWomen from "./routes/Women_product_display_routes.js";
import reviewRoutes from "./routes/reviews.js";

const app = express();
const port = 3000;

// Load SSL certificates
const options = {
  key: fs.readFileSync("certs/key.pem"),
  cert: fs.readFileSync("certs/cert.pem"),
};

// Create HTTPS server
const server = https.createServer(options, app);
const allowedOrigins = [
  'https://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.5:3000',   
  'http://example.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 

    // Always allow localhost:5173
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Dynamically allow any https://192.x.x.x:5173 or https://172.x.x.x:5173 IPs
    const localIPPattern = /^https:\/\/(192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+):5173$/;
    if (localIPPattern.test(origin)) {
      return callback(null, true);
    }

    // Otherwise, block
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,  // Optional — if you want cookies or auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Connection to MongoDB
connectDB();

// API Endpoints
app.use("/api/ecommerceproduct", ECommerceRouter);
app.use("/api/ecommerceproductedit", Update);
app.use("/api/sellerauthentication", SellerAuthenticationRouter);
app.use("/api/customerauthentication", CustomerAuthenticationRouter);
app.use("/api/admincontact", AdmincontactRouter);
app.use("/api/wishlist", WishlistRouter);
app.use("/api/productssellerdisplay", ProductDisplayRouter);
app.use("/api/ordernewsellerdisplay", Ordernew);
app.use("/api/orderdeliveredsellerdisplay", Delivered);
app.use("/api/productsdelete", Delete);
app.use("/api/productsdisplay", Display);
app.use("/api/productsdisplaymen", DisplayMen);
app.use("/api/productsdisplaywomen", DisplayWomen);
app.use("/api/productsdisplayhot", DisplayHot);
app.use("/api/productsdisplayoffers", DisplayOffer);
app.use("/api/pendingcart", PendingCartRouter);
app.use("/api/productsdetailsdisplay", Productdetails);
app.use("/api/productsaskquestions", AskQuestionsRouter);
app.use("/api/productsshowquestions", Questions);
app.use("/api/productsreplyquestions", AskQuestionReply);
app.use("/api/wishlistdisplay", WishlistDisplay);
app.use("/api/productssearch", Search);
app.use("/api/sellers", SellerAuthenticationRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/selleraccount", Sellerdetails);
app.use("/api/customeraccount", Customerdetails);
app.use("/api/customerreply", Reply);
app.use("/api/customerorder", Orderscustomer);
app.use("/api/customerdeletereply", router);
app.use("/api/orders", OrderRouter);
app.use("/api/admin", PrivateRoute);
app.use("/api/email", PrivateRoute);
app.use("/api/email", gmailController);
app.use("/api/reviews", reviewRoutes);
app.get("/", (req, res) => {
  res.send("Good to go");
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server Started on https://192.168.137.1:${port}`);
  });
}

export default app;