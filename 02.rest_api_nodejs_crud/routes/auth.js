import express from "express";
import {
  registerAccount,
  getAccountsAll,
  getAccounts,
  getAccount,
  editAccount,
  deleteAccount,
  loginAccount,
} from "../controllers/accounts.js";

const authRouter = express.Router();

authRouter.post("/register", registerAccount);

authRouter.get("/all", getAccountsAll);

authRouter.get("/", getAccounts);

authRouter.get("/:id", getAccount);

authRouter.patch("/:id", editAccount);

authRouter.delete("/:id", deleteAccount);

authRouter.post("/login", loginAccount);

export default authRouter;
