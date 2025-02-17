import React from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
const Navbar = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the handleLogout function.
  // This function should do an API call to log the user out.
  // On successful logout, redirect the user to the login page.
  const handleLogout = async (e) => {
    e.preventDefault();
    // Implement logout logic here
    const response = await fetch(`${apiUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
    console.log(response);
    if(response.status === 200){
      navigate("/login");
    }
    else{
      console.log("Error logging out");
      const result = await response.json();
      console.log(result.message);
      const errorMessage = document.createElement("div");
      errorMessage.style.color = "red";
      errorMessage.textContent = result.message;
      document.body.appendChild(errorMessage);
    }
  };

  // TODO: Use JSX to create a navigation bar with buttons for:
  // - Home
  // - Products
  // - Cart
  // - Logout
  return (
    <nav style={{ 
      display: 'flex', 
      gap: '20px', // Adjust spacing between items
      fontFamily: 'sans-serif', // Use a clean font
      fontSize: '16px',     // Adjust font size as needed
      fontWeight: '500' // Adjust font weight as needed
    }}>
      <button onClick={() => navigate("/")} style={navButtonStyle}>Home</button>
      <button onClick={() => navigate("/products")} style={navButtonStyle}>Products</button>
      <button onClick={() => navigate("/cart")} style={navButtonStyle}>Cart</button>
      <button onClick={handleLogout} style={navButtonStyle}>Logout</button>
    </nav>
  );
};

const navButtonStyle = {
  background: 'none', // Remove background
  border: 'none',    // Remove borders
  padding: '0',     // Remove default padding
  cursor: 'pointer',  // Make it look clickable
  color: '#333',     // Set your desired text color
  // Add hover effect (optional)
  '&:hover': {
    color: '#007bff' // Example hover color
  }
};

export default Navbar;
