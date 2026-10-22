const express = require("express")
const app = express()
const authRoute = require("./route/authRoute")
const userRoute = require("./route/userRoutes")
const cors = require("cors");
app.use(cors());
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/users", userRoute);
module.exports = app;