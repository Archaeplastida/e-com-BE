const express = require('express');
const app = express();
const {PORT} = require("./config/config");
const db = require('./config/db');

// Middleware
app.use(express.json()); // For parsing JSON bodies

// Routes
// const authRoutes = require("./routes/auth");
// const productsRoutes = require("./routes/products");
// const usersRoutes = require("./routes/users");

const getUsers = async () => {
  const result = await db.query(
    `SELECT * FROM users`
  )

  return result.rows[0];
}


app.get('/', async (req, res) => {
  let allUsers = await getUsers();
  res.send(allUsers);
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;