const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'yashjonjale',
  host: 'localhost',
  database: 'ecommerce',
  password: 'boomboom123',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  next();
}

function isLoggedIn(req, res, next) {
  next();
}


// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', isLoggedIn, async (req, res) => {
  // extract username, email and password
  const { username, email, password } = req.body;

  // check if if format is valid
  if (!username || !email || !password) {
    return res.status(500).json({ message: "Error Signing Up" });
  }
  // insert the user into the database
  try {
    const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(400).json({ message: "Error: Email is already registered." });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await pool.query(
      "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, passwordHash]
    );
    req.session.userId = newUser.rows[0].user_id;
    return res.status(200).json({ message: "User Registered Successfully", email: email, password: password, username: username });

  } catch (err) {
    return res.status(500).json({ message: "Error Signing Up" });
  }
  });

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  // extract email and password
  const { email, password } = req.body;

  // check if format is valid
  if (!email || !password) {
    return res.status(500).json({ message: "Error Logging In" });
  }

  // check if email exists in the database
  try {
    const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // check if password is correct
  const passwordMatch = await bcrypt.compare(password, user.rows[0].password_hash);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // add the userId to the session
  req.session.userId = user.rows[0].user_id;

  return res.status(200).json({ message: "Login successful", email: email, password: password });
  } catch (err) {
    return res.status(500).json({ message: "Error Logging In" });
  } 

});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
    if(req.session.userId){
        // query the database for username
        try{
          const user = await pool.query("SELECT * FROM Users WHERE user_id = $1", [req.session.userId]);
          res.status(200).json({message: "Logged in", username: user.rows[0].username});
        } catch (err) {
          return res.status(500).json({message: "Error checking if user is logged in"});
        }

        
    }
    else{
      res.status(400).json({message: "Not logged in"});
    }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  console.log("Logging out");
  req.session.destroy((err) => {
    if(err){    
      return res.status(500).json({message: "Failed to log out"});
    }
    res.status(200).json({message: "Logged out successfully"});
  });
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
    // query the database for all products
    try{
      const products = await pool.query("SELECT * FROM Products order by product_id");
      res.status(200).json({products: products.rows, message: "Products fetched successfully"});
    } catch (err) {
      return res.status(500).json({message: "Error listing products"});
    }

  

});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
    // extrsact product quantity and product_id
    // let { product_id, quantity } = req.body;
    // quantity = Number(quantity);
    // product_id = Number(product_id);
    // console.log(product_id, quantity);
    // console.log("NOW");
// const response = await fetch(`${apiUrl}/add-to-cart`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include", // Include cookies in the request
//         body: JSON.stringify({ productId, quantity }),
//       });

    // as per the above post request, the product_id and quantity are in the body of the request

    const { product_id, quantity } = req.body;
    console.log(product_id, quantity);


    // check if product if exists in the database and if it does extract its entry from the products table
    try{
      const product = await pool.query("SELECT * FROM Products WHERE product_id = $1", [product_id]);
      if(product.rows.length === 0){
        return res.status(400).json({message: "Invalid Product ID"});
      }
      const cartItem = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [req.session.userId, product_id]);
      if(cartItem.rows.length > 0){
        // check user quantity is correct with respect to the stock
        if(cartItem.rows[0].quantity + quantity > product.rows[0].stock){
          return res.status(400).json({message: "Insufficient stock for ${product.rows[0].name}"});
        }
        const updatedCartItem = await pool.query("UPDATE Cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [quantity+cartItem.rows[0].quantity, req.session.userId, product_id]);
    }
    else{
      if (quantity > product.rows[0].stock){
        return res.status(400).json({message: "Insufficient stock for ${product.rows[0].name}"});
      }
      const newCartItem = await pool.query("INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1, $2, $3)", [req.session.userId, product_id, quantity]);

    }
    return res.status(200).json({message: "Successfully added ${quantity} of ${product.rows[0].name} to your cart."});

    
    } catch (err) {
      return res.status(500).json({message: "Error adding to cart"});
    }



});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
    const user_id = req.session.userId;
    try {
      const result = await pool.query(`
        SELECT 
        Cart.item_id as item_id,  
        Products.product_id as product_id,
        Products.name as product_name, Cart.quantity as quantity, 
        Products.price as unit_price, Products.price * Cart.quantity as total_item_price, 
        CASE WHEN Cart.quantity <= Products.stock_quantity THEN 'YES' ELSE NULL END as instock,
        Products.stock_quantity as stock_quantity 
        FROM Products, Cart 
        WHERE Cart.user_id = $1 AND Cart.item_id = Products.product_id 
        ORDER BY product_id`, [user_id]);

        // if 0 entries then res.json
        if(result.rows.length === 0){
          return res.status(200).json({message: "No items in cart", cart: [], totalPrice: 0});
        }

        let sum = Number(0);
        for(let i =0; i<result.rows.length; i++){
          sum += Number(result.rows[i].total);
        }

        res.status(200).json({message: "Cart fetched successfully", cart: result.rows, totalPrice: sum});

        



    } catch (err) {
      return res.status(500).json({ message: "Error fetching cart" });
    }


    
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {

    // extract product_id
    const { product_id } = req.body;
    // check if product exists in the cart
    try{
      const cartItem = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [req.session.userId, product_id]);
      if(cartItem.rows.length === 0){
        return res.status(400).json({message: "Item not present in your cart."});
      }
  
      const removedCartItem = await pool.query("DELETE FROM Cart WHERE user_id = $1 AND item_id = $2", [req.session.userId, product_id]);
      return res.status(200).json({message: "Successfully removed from cart"});
    } catch (err) {
      return res.status(500).json({message: "Error removing item from cart"});
    }

   

});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
    // extract product_id and quantity
    let { product_id, quantity } = req.body;
    quantity = Number(quantity);
    product_id = Number(product_id);

    // check if product exists in the cart
    try{
      const cartItem = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [req.session.userId, product_id]);
      const product = await pool.query("SELECT * FROM Products WHERE product_id = $1", [product_id]);
      if(product.rows.length === 0){
        return res.status(400).json({message: "Error updating cart"});
      }
      const prod_quantity = product.rows[0].stock;
      const cart_quantity = 0;
      // check if product in cart 
      if(cartItem.rows.length > 0){
          cart_quantity = cartItem.rows[0].quantity;
          if (quantity + cart_quantity < 0){
            return res.status(400).json({message: "Error updating cart"});
          }
          if (quantity + cart_quantity > prod_quantity){
            return res.status(400).json({message: "Requested quantity exceeds available stock"});
          }
          const updatedCartItem = await pool.query("UPDATE Cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [quantity, req.session.userId, product_id]);
        } 
      else{
          // if not in cart, add to cart
  
          if (quantity < 0){
            return res.status(400).json({message: "Error updating cart"});
          }
          if (quantity > prod_quantity){
            return res.status(400).json({message: "Requested quantity exceeds available stock"});
          }
          const newCartItem = await pool.query("INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1, $2, $3)", [req.session.userId, product_id, quantity]);
      }
    } catch (err) {
      return res.status(500).json({message: "Error updating cart"});
    }
    // check if quantity is valid with respect to stock

    // check if product exists
    


});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {

  try {
    const result = await pool.query(`SELECT 
      Products.product_id as product_id, 
      Products.name as name, 
      Cart.quantity as quantity, 
      Products.price as price, 
      Products.price*Cart.quantity as total, 
      case when Cart.quantity <= Products.stock_quantity then \'YES\' else NULL end as instock 
      FROM Products, Cart 
      WHERE 
      Cart.user_id = $1 
      AND 
      Cart.item_id = Products.product_id;`, [req.session.userId]);
      if(result.rows.length === 0){
        return res.status(400).json({message: "Cart is empty"});
      }
    
      let sum = Number(0);
      for(let i =0; i<result.rows.length; i++){
        if (!result.rows[i].instock){
          return res.status(400).json({message: "Insufficient stock for ${result.rows[i].name}"});
        }
        sum += Number(result.rows[i].total);
      }
      const order = await pool.query("INSERT INTO Orders (user_id, total_amount) VALUES ($1, $2) RETURNING *", [req.session.userId, sum]);

  for(let i =0; i<result.rows.length; i++){
    const orderItem = await pool.query("INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)", [order.rows[0].order_id, result.rows[i].product_id, result.rows[i].quantity, result.rows[i].price]);
  }
  const updateStock = await pool.query(`UPDATE 
    Products 
    SET 
    stock_quantity = stock_quantity - $1 
    WHERE 
    product_id = $2;`, [Number(result.rows[i].quantity), Number(result.rows[i].product_id)]);

  const deleteCart = await pool.query("DELETE FROM Cart WHERE user_id = $1", [req.session.userId]);

  return res.status(200).json({message: "Order placed successfully"});
  }
  catch (err) {
    return res.status(500).json({ message: "Error placing order" });
  }
 

  
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {

 

  try {
    const order = await pool.query("SELECT * FROM Orders WHERE user_id = $1 ORDER BY order_id DESC LIMIT 1", [req.session.userId]);

    if(order.rows.length === 0){
      return res.status(400).json({message: "Order"});
    }
    const orderItems = await pool.query("SELECT OrderItems.order_id, OrderItems.product_id, OrderItems.quantity, OrderItems.price, Products.name as product_name FROM OrderItems, Products WHERE OrderItems.order_id = $1 AND OrdersItems.product_id = Products.product_id order by OrderItems.product_id", [order.rows[0].order_id]);
    res.status(200).json({message: "Order fetched successfully", order: order.rows[0], orderItems: orderItems.rows});

  } catch (err) {
    return res.status(500).json({ message: "Error fetching order items" });
  }

});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});