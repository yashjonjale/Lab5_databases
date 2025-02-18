import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users


  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic here
      try {
        // return (<div>Checking login status</div>);
        // console.log("Checking login status");
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        // console.log("data", data);
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
    // while(true);
  }, []);

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
    const { name, value } = e.target;

    // Read about the spread operator (...) to understand this syntax
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the login logic here
    try{
      // console.log("formData", formData);
      const response = await fetch(`${apiUrl}/login`, {
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
      } 
      else{
        setError(data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      alert("An error occurred while authentication Please try again.");
      navigate("/login");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  };

  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  return (
    <div style={{ maxWidth: "300px", margin: "auto", textAlign: "left" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Login</h2>
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit" 
            style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            backgroundColor: "lightgray",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
          }}>Login</button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Don't have an account? <a href="/signup" style={{ color: "blue", textDecoration: "underline" }}>Sign up here</a>
      </p>
    </div>
  );
};

export default Login;
