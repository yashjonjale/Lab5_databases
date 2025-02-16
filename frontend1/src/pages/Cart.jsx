import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  // State for cart, total price, errors & messages
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State for address form
  const [address, setAddress] = useState({
    pincode: "",
    street: "",
    city: "",
    state: "",
  });

  // ----------------------------------------------------------------
  // 1) Check Login Status on Page Load
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status === 200) {
          // User is logged in, fetch cart
          fetchCart();
        } else {
          // Not logged in
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        alert("An error occurred while authenticating. Please log in again.");
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // ----------------------------------------------------------------
  // 2) Fetch Cart Items
  // ----------------------------------------------------------------
  const fetchCart = async () => {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/display-cart`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 200) {
        setCart(data.cart || []);
        setTotalPrice(data.totalPrice || 0);
        if (data.message && data.cart.length === 0) {
          // e.g. "No items in cart."
          setMessage(data.message);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("An error occurred while fetching the cart. Please try again.");
    }
  };

  // ----------------------------------------------------------------
  // 3) Update Quantity of Items in the Cart
  // ----------------------------------------------------------------
  const updateQuantity = async (
    productId,
    change,
    currentQuantity,
    stockQuantity
  ) => {
    try {
      const newQuantity = currentQuantity + change;
      // Check stock & that newQuantity isn't negative
      if (newQuantity > stockQuantity || newQuantity < 0) {
        return;
      }

      const response = await fetch(`${apiUrl}/update-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product_id: productId,
          // Per the API: "quantity" is the *change* (positive or negative).
          // If your backend expects the final quantity, you can adjust:
          quantity: change,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setMessage(data.message);
        fetchCart();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("An error occurred while updating the quantity. Please try again.");
    }
  };

  // ----------------------------------------------------------------
  // 4) Remove an Item from the Cart
  // ----------------------------------------------------------------
  const removeFromCart = async (productId) => {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/remove-from-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await response.json();
      if (response.status === 200) {
        setMessage(data.message);
        fetchCart();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Error removing the item from cart. Please try again.");
    }
  };

  // ----------------------------------------------------------------
  // 5) Handle Pin Code Change - Autofill City & State
  // ----------------------------------------------------------------
  const handlePinCodeChange = async (e) => {
    const newPinCode = e.target.value;
    setAddress((prev) => ({
      ...prev,
      pincode: newPinCode,
    }));

    // We only call the external API if pincode is 6 digits
    if (newPinCode.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${newPinCode}`);
        const data = await res.json();
        if (data && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setAddress((prev) => ({
            ...prev,
            city: postOffice.Name || "",
            state: postOffice.State || "",
          }));
        } else {
          // If invalid or no data, clear city/state
          setAddress((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch (error) {
        console.error("Error fetching pincode data:", error);
        setAddress((prev) => ({ ...prev, city: "", state: "" }));
      }
    } else {
      // If length is not 6, reset city and state
      setAddress((prev) => ({ ...prev, city: "", state: "" }));
    }
  };

  // ----------------------------------------------------------------
  // 6) Handle Checkout - Place Order
  // ----------------------------------------------------------------
  const handleCheckout = async () => {
    setError("");
    setMessage("");

    // Validate address fields
    const { pincode, street, city, state } = address;
    if (!pincode || !street || !city || !state) {
      setError("Please fill in all the address fields before proceeding.");
      return;
    }

    // Place the order
    try {
      const response = await fetch(`${apiUrl}/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // The instructions say "No data present in the request" for /place-order,
        // but also mention passing address. Adjust as needed for your backend:
        body: JSON.stringify(address),
      });

      const data = await response.json();
      if (response.status === 200) {
        // Order placed, redirect to order confirmation
        setMessage(data.message);
        navigate("/order-confirmation");
      } else {
        // 400 or 500 error
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "An error occurred while placing the order.");
    }
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  // Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>

      {/* Display success or info messages */}
      {message && <div className="cart-message">{message}</div>}

      {/* If cart is empty, show message; otherwise show cart table */}
      {0 != 0 ? (
        <p className="empty-cart-message">
          {message || "Your cart is empty"}
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Available</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Sort items by product_id before mapping */}
              {cart
                // .sort((a, b) => a.product_id - b.product_id)
                .map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.product_name}</td>
                    <td>${item.unit_price}</td>
                    {/* We assume the API returns something like stockAvailable. 
                        Adjust field name if needed. */}
                    <td>{item.stock_quantity ?? "N/A"}</td>
                    <td>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            -1,
                            item.quantity,
                            item.stockAvailable
                          )
                        }
                      >
                        -
                      </button>
                      <span style={{ margin: "0 10px" }}>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            1,
                            item.quantity,
                            item.stockAvailable
                          )
                        }
                      >
                        +
                      </button>
                    </td>
                    <td>${item.total_item_price}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.product_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Address form */}
          <div className="address-form">
            <h2>Delivery Address</h2>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                value={address.pincode}
                onChange={handlePinCodeChange}
              />
            </div>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
              />
            </div>
            {/* city & state must not be editable */}
            <div className="form-group">
              <label>City</label>
              <input type="text" value={address.city} disabled />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" value={address.state} disabled />
            </div>
          </div>

          {/* Total Price & Checkout Button */}
          <div className="cart-total">
            <h3>Total: ${totalPrice}</h3>
            <button onClick={handleCheckout} disabled={cart.length === 0}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
