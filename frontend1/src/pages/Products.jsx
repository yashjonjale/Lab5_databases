import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // Read about useState to understand how to manage component state
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState("");

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  // if logged in, fetch the products
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        if (response.status === 200) {
          fetchProducts();
        }
        else if (response.status === 400) {
          navigate("/login");
        } 
        else if (response.status === 500){
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authentication Please try again.");
        navigate("/login");
      }
    };
    checkStatus();
  }, []);

  // NOTE: You are free to add more states and/or handler functions
  // to implement the features that are required for this assignment

  // TODO: Fetch products from the APIx
  // This function should send a GET request to fetch products
  const fetchProducts = async () => {
    // Implement the API call here to fetch product data
    try {
      const response = await fetch(`${apiUrl}/list-products`, {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });
      const data = await response.json();
      if (response.status === 200) {
        setProducts(data.products);
      } 
      else if(response.status === 400) {
        console.error(data.message);
        alert(data.message);
        navigate("/login");
      }
      else if (response.status === 500){
        alert(data.message);
        navigate("/products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("An error occurred while fetching products. Please try again.");
    }
  };
  
  // TODO: Implement the product quantity change function
  // If the user clicks on plus (+), then increase the quantity by 1
  // If the user clicks on minus (-), then decrease the quantity by 1
  const handleQuantityChange = (productId, change) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max(0, (prevQuantities[productId] || 0) + change),
    }));
  };

  // TODO: Add the product with the given productId to the cart
  // the quantity of this product can be accessed by using a state
  // use the API you implemented earlier
  // display appropriate error messages if any
  const addToCart = async (productId) => {
    const quantity = quantities[productId] || 0;
    const product = products.find((p) => p.product_id === productId);
    try {
      const response = await fetch(`${apiUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert(`Added ${quantity} ${product.product_name} to cart`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("An error occurred while adding product to cart. Please try again.");
    }
  };

  // TODO: Implement the search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement the search logic here
    // use Array.prototype.filter to filter the products
    // that match with the searchTerm
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setProducts(filteredProducts);
  };


  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div>
        <h1>Product List</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock Available</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.product_id}</td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleQuantityChange(product.product_id, -1)}>-</button>
                {quantities[product.product_id] || 0}
                <button onClick={() => handleQuantityChange(product.product_id, 1)}>+</button>
              </td>
              <td>
                <button onClick={() => addToCart(product.product_id)}>Add to Cart</button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Products;
