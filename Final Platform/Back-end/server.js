import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

import { initializeCustomerRoutes } from "./routes/Customer_account_routes.js";
import CustomerAuthenticationRouter from "./routes/Customer_authentication_routes.js";
import SellerAuthenticationRouter from "./routes/Seller_authentication_routes.js";
import Productdetails from "./routes/Product_details_routes.js";
import PendingCartRouter from "./routes/Pending_cart_routes.js";
const app = express();
const port = 3000;

// Create HTTP server for WebSocket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
    },
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/productsdetailsdisplay", Productdetails);
// Connection to MongoDB
connectDB();

// API Endpoints

app.use("/api/customerauthentication", CustomerAuthenticationRouter);
app.use("/api/customeraccount", initializeCustomerRoutes(io));
app.use("/api/sellers", SellerAuthenticationRouter);
app.use("/api/pendingcart", PendingCartRouter);
app.get("/", (req, res) => {
    res.send("Good to go");
});

// WebSocket connection logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("new-reply", (reply) => {
        io.emit("update-replies", reply);
    });

    socket.on("new-question", (question) => {
        io.emit("update-questions", question);
    });

    socket.on("new-message", (message) => {
        io.emit("broadcast-message", message);
    });

    socket.on("order-update", (order) => {
        io.emit("order-status-updated", order);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

if (process.env.NODE_ENV !== "test") {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server Started on http://localhost:${port}`);
    });
  }


// Start the server
// server.listen(port, () => {
//     console.log(`Server Started on http://localhost:${port}`);
// });

export { io };

export default app;
