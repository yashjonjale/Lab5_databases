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
  }, []);

  // TODO: Use useState to manage the orderDetails and error state


  // TODO: Implement the fetchOrderConfirmation function
  // This function should fetch order details from the API and set the state
  const fetchOrderConfirmation = async () => {
    // Implement your API call to fetch order details
    // Update the orderDetails state with the response data
    // Show appropriate error messages if any.
  };

  return (
    <>
    {/* Implement the JSX for the order-confirmation
     page as described in the assignment. */}
    </>
  );
};

export default OrderConfirmation;
