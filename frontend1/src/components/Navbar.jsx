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

    if(response.status === 200){
      navigate("/login");
    }
    else{
      const result = await response.json();
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
    <nav>
      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => navigate("/products")}>Products</button>
      <button onClick={() => navigate("/cart")}>Cart</button>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
