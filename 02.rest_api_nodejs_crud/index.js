import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

// Import Routes
import usersRoutes from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = 5000;

// Connect to DB:

// Cloud:
// mongoose.connect(process.env.DB_CONNECTION);

// Local:
mongoose.connect(process.env.DB_CONNECTION_LOCAL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Route Middlewares
app.use("/api/accounts", authRouter);
app.use("/api/users", usersRoutes);

// Simple Methods
app.get("/api", (req, res) => res.send("Hello from Home Page."));

// Listening
app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}/api`)
);
