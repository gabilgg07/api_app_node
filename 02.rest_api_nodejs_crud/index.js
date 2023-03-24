import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import usersRoutes from "./routes/users.js";

import mongoose from "mongoose";

import "dotenv/config";

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

app.use("/users", usersRoutes);

app.get("/", (req, res) => res.send("Hello from Home Page."));

// try {
// } catch (error) {
//   console.log(error, ">>e>>");
// }

mongoose.connect(process.env.DB_CONNECTION);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);
