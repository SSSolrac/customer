const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");
const profileRoutes = require("./routes/profileRoutes");
const loyaltyRoutes = require("./routes/loyaltyRoutes");
const menuRoutes = require("./routes/menuRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🚀" });
});

app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/menu", menuRoutes);

module.exports = app;
