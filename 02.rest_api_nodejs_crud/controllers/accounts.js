import fs from "fs";
import Account from "../models/Account.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// VALIDATION
import { registerValidation, loginValidation } from "../validation.js";

let accounts = [];

try {
  accounts = JSON.parse(fs.readFileSync("./data/accounts.json", "utf-8"));
} catch (error) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/accounts.json", JSON.stringify([]));
}

// var SpeechRecognition = SpeechRecognition || SpeechRecognition;
// var SpeechGrammarList = SpeechGrammarList || Window.webkitSpeechGrammarList;
// var SpeechRecognitionEvent = SpeechRecognitionEvent || SpeechRecognitionEvent;

// const synth = window.speechSynthesis;

// console.log(SpeechRecognition);
// console.log(SpeechGrammarList);
// console.log(SpeechRecognitionEvent);

//console.log(synth);

const addDbAccount = async (account) => {
  const accountForDb = new Account({
    _id: account._id,
    name: account.name,
    email: account.email,
    password: account.password,
    createdDate: account.createdDate,
    deletedDate: account.deletedDate,
    modifiedDate: account.modifiedDate,
  });

  try {
    const savedAccount = await accountForDb.save();

    console.log(`Account ${savedAccount.name} added`);
  } catch (error) {
    console.log("\n<>error-addDbAccount<>\n", error, "\n");
  }
};

const modifiedFoundAccount = async (acnt, isFromDb) => {
  const account = {
    name: acnt.name,
    email: acnt.email,
    password: acnt.password,
    createdDate: acnt.createdDate,
    deletedDate: acnt.deletedDate,
    modifiedDate: acnt.modifiedDate,
  };

  if (isFromDb) {
    let lAcnt = accounts.find((lA) => lA._id === acnt._id);
    lAcnt = {
      ...lAcnt,
      ...account,
    };

    fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));

    console.log(`Local-da ${lAcnt.name} deyisildi:${acnt._id}`);
  } else {
    try {
      const uA = await Account.updateOne(
        { _id: acnt._id },
        {
          $set: account,
        }
      );

      console.log(`DB-da ${account.name} deyisildi:${acnt._id}`);
    } catch (error) {
      console.log("\n<>error-modifiedFoundAccount<>\n", error, "\n");
    }
  }
};

const getAccountsForDb = async () => {
  try {
    const db = await Account.find();

    // console.log(Object.keys(db[0].toObject()));
    // const updateM = await Account.updateMany({}, { isAdmin: false });
    // console.log(updateM);

    // if (accounts && accounts.length > 0) {
    //   if (!Object.keys(accounts[0]).includes("isAdmin")) {
    //     accounts = accounts.map((item) => (item = { ...item, isAdmin: false }));
    //     console.log(accounts);
    //     fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));
    //   }
    // }

    if (accounts.length > 0) {
      accounts.forEach((acnt) => {
        if (!db.some((account) => account._id.toString() === acnt._id)) {
          addDbAccount(acnt);
        }

        const foundA = db.find((item) => item._id.toString() === acnt._id);

        if (foundA) {
          const foundAMD = new Date(foundA.modifiedDate);
          const accountMD = new Date(acnt.modifiedDate);

          const isFromDb = accountMD.getTime() < foundAMD.getTime();

          // console.log(foundA.modifiedDate);

          if (foundAMD.getTime() !== accountMD.getTime()) {
            modifiedFoundAccount(isFromDb ? foundA : acnt, isFromDb);
          }
        }
      });
    } else if (db.length > 0) {
      accounts = db;
      fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));
    }
  } catch (error) {
    console.log("\n<>error-getAccountsForDb<>\n", error, "\n");
  }
};

getAccountsForDb();

export const getAccountsAll = async (req, res) => {
  try {
    const accountsDb = await Account.find();
    res.send({
      accountInfo: req.account,
      accounts: accountsDb,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const accountsDb = await Account.find({ deletedDate: null });
    res.send(accountsDb);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const getAccount = async (req, res) => {
  const { id } = req.params;

  const accountFound = accounts.find(
    (acnt) => acnt._id === id && acnt.deletedDate === null
  );

  if (!accountFound) {
    return res.status(404).json({
      message: "Account not found!",
      inLocal: true,
    });
  }

  try {
    const account = await Account.findById(id);

    if (!account || account.deletedDate !== null) {
      return res.status(404).json({
        message: "Account not found!",
      });
    }

    res.send(account);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

export const editAccount = async (req, res) => {
  const { id } = req.params;

  if (!Object.keys(req.body).length > 0) {
    return res.status(400).json({
      message: "Data not sent!",
    });
  }
  const { name, email, password } = req.body;

  if (!(name || email || password)) {
    return res.status(400).json({
      message: "No valid data sent!",
    });
  }

  const accountFound = accounts.find(
    (acnt) => acnt._id === id && acnt.deletedDate === null
  );

  if (!accountFound) {
    return res.status(404).json({
      message: "Account not found!",
    });
  }

  try {
    const found = await Account.findOne()
      .nor({ _id: id })
      .and({ deletedDate: null })
      .or({ email: email });

    if (found) {
      return res.status(404).json({
        message: "This email address is already available!",
      });
    }
  } catch (error) {
    console.log("\n<>error-editAccount_FindOne<>\n", error, "\n");
  }

  try {
    const account = await Account.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          email: email,
          password: password,
          modifiedDate: new Date(),
        },
      }
    );

    if (!account) {
      return res.status(404).json({
        message: "Account not found!",
      });
    }

    if (name) accountFound.name = name;
    if (email) accountFound.email = email;
    if (password) accountFound.password = password;
    accountFound.modifiedDate = new Date();

    fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));

    res.status(200).json({
      message: `${accountFound.name} edited`,
    });
  } catch (error) {
    res.json(error);
  }
};

export const deleteAccount = async (req, res) => {
  const { id } = req.params;

  const accountFound = accounts.find(
    (acnt) => acnt._id === id && acnt.deletedDate === null
  );

  if (!accountFound) {
    return res.status(404).json({
      message: "Account not found!",
    });
  }

  try {
    const account = await Account.updateOne(
      { _id: id },
      { $set: { deletedDate: new Date(), modifiedDate: new Date() } }
    );

    if (!account) {
      return res.status(404).json({
        message: "Account not found!",
      });
    }

    accountFound.deletedDate = new Date();
    accountFound.modifiedDate = new Date();

    fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));

    res.status(200).json({
      message: `${accountFound.name} deleted`,
    });
  } catch (error) {
    console.log("\n<>error-deleteAccount<>\n", error, "\n");
    res.json({ message: error });
  }
};

export const registerAccount = async (req, res) => {
  // LET VALIDATE THE ACCOUNT BEFORE WE MAKE A ACCOUNT
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the account is alredy in the DB
  const emailExist = await Account.findOne({ email: req.body.email });
  if (emailExist) return res.status(409).send("Email already exists");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new Account
  const account = new Account({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedAccount = await account.save();
    accounts.push(savedAccount);
    fs.writeFileSync(`data/accounts.json`, JSON.stringify(accounts));
    res.send(savedAccount);
  } catch (error) {
    res.send({ message: error.toString() });
  }
};

export const loginAccount = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the email(account) is exist in the DB
  const account = await Account.findOne({ email: req.body.email });
  if (!account) return res.status(400).send("Account is not found");

  //PASSWORD IS CORRECT
  const validPas = await bcrypt.compare(req.body.password, account.password);
  if (!validPas) return res.status(400).send("Invalid password");

  // Creat and asign a token
  const token = jwt.sign({ _id: account._id }, process.env.TOKEN_SECRET);

  res.header("auth-token", token).send(token);
};
