import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Dashboard = () => {
  const navigate = useNavigate(); // Use this to redirect users

  const [username, setUsername] = useState("User");

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      // If logged in, then use setUsername to display
      // the username
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        if (response.status === 200) {
          setUsername(data.username);
        }
        else if (response.status === 500) {
          throw new Error(data.message);
        }
        else{
          navigate("/login");
        }
      }
      catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authentication Please try again.");
        navigate("/login");
      }
    };
    checkStatus();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', // Align items vertically
        alignItems: 'flex-start', // Align to the left
        padding: '20px',        // Add some padding around the content
        fontFamily: 'sans-serif' // Use a clean font
      }}>
        <h1 style={{ 
          color: '#3CB371',   // Green color like in the image
          fontSize: '2em',    // Adjust font size as needed
          fontWeight: 'bold',  // Make it bold
          marginBottom: '10px' // Space below the heading
        }}>
          Hi {username}!
        </h1>
        <div style={{ 
          fontSize: '1.2em', // Adjust font size as needed
          color: '#333'      // Darker text color
        }}>
          Welcome to the Ecommerce App
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
