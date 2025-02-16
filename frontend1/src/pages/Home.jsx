import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

// Use the API you implemented earlier, 
// to check if the user is logged in or not
// if yes, navigate to the dashboard
// else to the login page

// use the React Hooks useNavigate and useEffect
// to implement this component
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        if (response.status === 200) {
          navigate("/dashboard");
        } 
        else if (response.status === 500){
          throw new Error(data.message);
        }
        else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authentication Please try again.");
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, []);
  
  return <div>HomePage</div>;
};

export default Home;
