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

  // check if email exists in the database
//   CREATE TABLE Users (
//     user_id SERIAL PRIMARY KEY,
//     username VARCHAR(100) NOT NULL,
//     email VARCHAR(100) UNIQUE NOT NULL,
//     password_hash TEXT NOT NULL
// );

  const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);

  if (user.rows.length > 0) {
    return res.status(400).json({ message: "Error: Email is already registered." });
  }

  // hash the password using bcrypt

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // insert the user into the database
  try {
    const newUser = await pool.query(
      "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, passwordHash]
    );
  } catch (err) {
    return res.status(500).json({ message: "Error Signing Up" });
  }

  // add the userId to the session

  req.session.userId = newUser.rows[0].user_id;


  return res.status(200).json({ message: "User Registered Successfully", email: email, password: password, username: username });
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
  } catch (err) {
    return res.status(500).json({ message: "Error Logging In" });
  }

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

});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
    if(req.session.userId){
        // query the database for username
        try{
          const user = await pool.query("SELECT * FROM Users WHERE user_id = $1", [req.session.userId]);
        } catch (err) {
          return res.status(500).json({message: "Error checking if user is logged in"});
        }

        res.status(200).json({message: "Logged in", username: user.rows[0].username});
    }
    else{
      res.status(400).json({message: "Not logged in"});
    }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.get("/logout", (req, res) => {
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
      const products = await pool.query("SELECT * FROM Products");
    } catch (err) {
      return res.status(500).json({message: "Error listing products"});
    }

    res.status(200).json({products: products.rows, message: "Products fetched successfully"});

});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
    // extrsact product quantity and product_id
    let { product_id, quantity } = req.body;
    quantity = Number(quantity);
    product_id = Number(product_id);
    // check if product if exists in the database and if it does extract its entry from the products table
    try{
      const product = await pool.query("SELECT * FROM Products WHERE product_id = $1", [product_id]);
    } catch (err) {
      return res.status(500).json({message: "Error adding to cart"});
    }

    // check if product exists 
    if(product.rows.length === 0){
      return res.status(400).json({message: "Invalid Product ID"});
    }


    // valid product and quantity, so insert in the cart

  //   CREATE TABLE Cart (
  //     user_id INT NOT NULL,
  //     item_id INT NOT NULL,
  //     quantity INT NOT NULL CHECK (quantity > 0),
  //     PRIMARY KEY (user_id, item_id),
  //     FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  //     FOREIGN KEY (item_id) REFERENCES Products(product_id) ON DELETE CASCADE
  // );

    // if already in cart, update the quantity
    try{
      const cartItem = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [req.session.userId, product_id]);
    } catch (err) {
      return res.status(500).json({message: "Error adding to cart"});
    }

    if(cartItem.rows.length > 0){
        // check user quantity is correct with respect to the stock
        if(cartItem.rows[0].quantity + quantity > product.rows[0].stock){
          return res.status(400).json({message: "Insufficient stock for ${product.rows[0].name}"});
        }
        try{
          const updatedCartItem = await pool.query("UPDATE Cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [quantity+cartItem.rows[0].quantity, req.session.userId, product_id]);
        } catch (err) {
          return res.status(500).json({message: "Error adding to cart"});
        }
    }
    else{
      if (quantity > product.rows[0].stock){
        return res.status(400).json({message: "Insufficient stock for ${product.rows[0].name}"});
      }
      try{
        const newCartItem = await pool.query("INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1, $2, $3)", [req.session.userId, product_id, quantity]);
      } catch (err) {
        return res.status(500).json({message: "Error adding to cart"});
      }
    }
    return res.status(200).json({message: "Successfully added ${quantity} of ${product.rows[0].name} to your cart."});

});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
    const user_id = req.session.userId;

    
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {


});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {

});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {

});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {

});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});