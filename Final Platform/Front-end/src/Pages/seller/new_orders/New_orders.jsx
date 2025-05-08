import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Order_status } from "../../../Components/Modules/order_status/Order_status";
import "./new_orders.css";

const New_orders = () => {
  const [orders, setOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    const sellerId = localStorage.getItem("sellerId");
    try {
      const response = await fetch(
        `https://192.168.137.1:3000/api/ordernewsellerdisplay/${sellerId}`
      );
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Set up polling for real-time updates
    const pollInterval = setInterval(fetchOrders, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  const handleStatusUpdate = async (status) => {
    try {
      const response = await fetch(
        `https://192.168.137.1:3000/api/ordernewsellerdisplay/${selectedOrder}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update local state immediately for instant feedback
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder ? { ...order, status: status } : order
          )
        );
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }

    setModalOpen(false);
  };

  // Helper function to format price with commas and .00
  const formatPrice = (price) => {
    return price
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div>
      <div className="new-order-container">
        <table className="new-order-tbl">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Customer Address</th>
              <th>Customer Phone</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td data-label="Product Name">
                  {order.productId?.ProductName}
                </td>
                <td data-label="Quantity">{order.quantity}</td>
                <td data-label="Price">{formatPrice(order.price)}</td>
                <td data-label="Customer Address">
                  {order.customerId?.CustomerAddress}
                </td>
                <td data-label="Customer Phone">
                  {order.customerId?.CustomerPhoneNumber}
                </td>
                <td
                  data-label="Status"
                  className={`new-order-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </td>
                <td data-label="Update">
                  <button
                    className="new-order-btn-status"
                    onClick={() => {
                      setSelectedOrder(order._id);
                      setModalOpen(true);
                    }}
                  >
                    Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen &&
        createPortal(
          <Order_status
            closeModal={() => setModalOpen(false)}
            onSubmit={handleStatusUpdate}
          />,
          document.body
        )}
    </div>
  );
};

export default New_orders;