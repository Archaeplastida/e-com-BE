const express = require('express');
const app = express();
const db = require('./config/db');
const cors = require("cors");
const ExpressError = require("./expressError")
const { authenticateJWT } = require("./middleware/auth");

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cors());
app.use(authenticateJWT);
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/users", usersRoutes);

// app.get('/', async (req, res) => {
//   let allUsers = await getUsers();
//   res.send(allUsers);
// });

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") console.error(err.stack);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;