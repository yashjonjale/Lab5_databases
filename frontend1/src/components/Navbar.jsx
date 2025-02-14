import React from "react";
import { useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the handleLogout function.
  // This function should do an API call to log the user out.
  // On successful logout, redirect the user to the login page.
  const handleLogout = async (e) => {
    e.preventDefault();
    // Implement logout logic here
    try{
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
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

    </nav>
  );
};

export default Navbar;
