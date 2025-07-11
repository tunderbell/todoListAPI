require("dotenv").config();
const express = require("express");

//Import for CORS middleware - security basically
const cors = require("cors");
const db = require("./database/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes--
const authRoutes = require("./routes/auth.routes");
const todoRoutes = require("./routes/todo.routes");
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

//Tells us thru console whether the database connection is successful
db.query("SELECT 1")
  .then(() => console.log("PostgreSQL database connected successfully."))
  .catch((err) => console.error("Database connection failed:", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
