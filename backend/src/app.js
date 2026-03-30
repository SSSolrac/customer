const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const profileRoutes = require("./routes/profileRoutes");
const loyaltyRoutes = require("./routes/loyaltyRoutes");
const menuRoutes = require("./routes/menuRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Backend is running 🚀" }));

app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
