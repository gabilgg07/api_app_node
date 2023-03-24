import express from "express";
import {
  getUsersAll,
  getUsers,
  getUser,
  createUser,
  editUser,
  deleteUser,
} from "../controllers/users.js";

const router = express.Router();

// all routes in here are starting with /users

router.get("/all", getUsersAll);

router.get("/", getUsers);

router.get("/:id", getUser);

router.post("/", createUser);

router.patch("/:id", editUser);

router.delete("/:id", deleteUser);

export default router;
