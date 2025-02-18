import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";

const OrderConfirmation = () => {
  // TODO: Implement the checkStatus function
  // If the user is logged in, fetch order details.
  // If not logged in, redirect the user to the login page.
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      // Implement logic here to check if the user is logged in
      // If not, navigate to /login
      // Otherwise, call the fetchOrderConfirmation function
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        if (response.status === 200) {
          fetchOrderConfirmation();
        }
        else{
          alert(data.message);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authentication Please try again.");
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // TODO: Use useState to manage the orderDetails and error state


  // TODO: Implement the fetchOrderConfirmation function
  // This function should fetch order details from the API and set the state
  const fetchOrderConfirmation = async () => {
    // Implement your API call to fetch order details
    // Update the orderDetails state with the response data
    // Show appropriate error messages if any.
    try {
      const response = await fetch(`${apiUrl}/order-confirmation`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.status !== 200) {
        setError(data.message);
        return;
      }
      // Sort items by product_id
      // data.items.sort((a, b) => a.product_id - b.product_id);

      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("An error occurred while fetching order details. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        <h2 className="order-confirmation-title">Order Confirmation</h2>
        {error && <p className="error-message">{error}</p>}
        {orderDetails ? (
          <>
            <p>Thank you for your order! Your order has been successfully placed.</p>
            <div className="order-details">
              <p><strong>Order ID:</strong> {orderDetails.order.order_id}</p>
              <p><strong>Order Date:</strong> {new Date(orderDetails.order.order_date).toLocaleString('en-GB', { hour12: false })}</p>
              <p><strong>Total Amount:</strong> ${orderDetails.order.total_amount}</p>
            </div>
            <h3>Items in Your Order:</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price per Item</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.orderItems.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_id}</td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </>
        ) : (
          <p>Loading order details...</p>
        )}
      </div>
    </>
  );
};

export default OrderConfirmation;
