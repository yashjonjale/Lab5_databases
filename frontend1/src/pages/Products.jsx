import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Products.css";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // Read about useState to understand how to manage component state
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState("");
  const [allProducts, setAllProducts] = useState([]);

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
        setAllProducts(data.products);
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
      alert("An error occurred while fetching products. Please try again.");
      navigate("/products");
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
    // console.log(products);
    try {
      const response = await fetch(`${apiUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ product_id: productId, quantity: quantity }),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert(`Added ${quantity} ${product.name} to cart`);
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
    const filteredProducts = allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setProducts(filteredProducts);
  };


  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div className="products-container"> {/* Container for styling */}
        <h1 className="product-list-title">Product List</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        <table className="product-table">
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
                <td>${product.price}</td>
                <td className={product.stock_quantity > 0 ? 'stock-available' : 'stock-low'}>
                  {product.stock_quantity}
                </td>
                <td>
                  <div className="quantity-control">
                    <button onClick={() => handleQuantityChange(product.product_id, -1)}>-</button>
                    <span>{quantities[product.product_id] || 0}</span>
                    <button onClick={() => handleQuantityChange(product.product_id, 1)}>+</button>
                  </div>
                </td>
                <td>
                  <button onClick={() => addToCart(product.product_id)} className="add-to-cart">
                    Add to Cart
                  </button>
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
