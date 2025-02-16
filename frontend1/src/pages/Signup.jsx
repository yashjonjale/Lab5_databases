import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Signup = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // If the user is already logged in, make an API call 
  // to check their authentication status.
  // If logged in, redirect to the dashboard.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here
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
      } catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authentication Please try again.");
        navigate("/signup");
      }
    };
    checkStatus();
  }, []);

  // Read about useState to understand how to manage component state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // This function handles input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Read about the spread operator (...) to understand this syntax
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the sign-up operation
  // This function should send form data to the server
  // and handle success/failure responses.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the sign-up logic here
    try{
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.status === 200) {
        navigate("/dashboard");
      } else {
        setError(data.message);
        navigate("/signup");
      }
    }
    catch{
      console.error(error);
      navigate("/signup");
    }
  };

  const inputStyle = {
    width: "100%", // Set the width of the input fields to 100% of their parent container
    padding: "10px",
    margin: "5px 0",
    boxSizing: "border-box",
  };

  // TODO: Use JSX to create a sign-up form with input fields for:
  // - Username
  // - Email
  // - Password
  // - A submit button
  return (
    <div>
      <h2>Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style = {inputStyle}
          />
        </div>
        <div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style = {inputStyle}
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style = {inputStyle}
          />
        </div>
        <button type="submit">Sign up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Signup;
