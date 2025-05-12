import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Summary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");

  useEffect(() => {
    const generateReport = async () => {
      try {
        // Fetch all seller orders
        const response = await fetch(
          `/api/ordernewsellerdisplay/${sellerId}`
        );
        const data = await response.json();

        if (!data.success) throw new Error(data.message);

        // Process order data
        const productSales = {};
        let grandTotal = 0;

        data.orders.forEach((order) => {
          const product = order.productId;
          if (product) {
            const productId = product._id;
            
            if (!productSales[productId]) {
              productSales[productId] = {
                name: product.ProductName,
                quantity: 0,
                price: product.ProductPrice, // Using product price from product data
                total: 0,
                date: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"
              };
            }

            // Accumulate values
            productSales[productId].quantity += order.quantity;
            productSales[productId].total += order.price;
            grandTotal += order.price;
          }
        });

        // Create CSV content with the exact requested format
        let csvContent = "Product Name,Sold Quantity,Item Price,Total,Date Of Sold\n";
        
        Object.values(productSales).forEach((product) => {
          csvContent += `${product.name},${product.quantity},${product.price},${product.total},${product.date}\n`;
        });

        csvContent += `Grand Total,,,${grandTotal},\n`;

        // Create and trigger download
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "sales-report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Navigate back after download
       navigate("../Seller_home");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [navigate, sellerId]);

  if (loading) return <div className="loading">Generating sales report...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return null;
};

export default Summary;