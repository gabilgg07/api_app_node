import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import User from "../models/User.js";

let users = [];

try {
  users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
} catch (error) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/users.json", JSON.stringify([]));
}

export const getUsersAll = async (req, res) => {
  try {
    const usersDb = await User.find();
    res.send(usersDb);
  } catch (error) {
    res.status(500).json({ message: error });
  }

  //   res.send(users);
};

export const getUsers = async (req, res) => {
  try {
    const usersDb = await User.find({ deletedDate: null });
    res.send(usersDb);
  } catch (err) {
    res.status(500).json({ message: err });
  }

  //   res.send(users.filter((u) => u.deletedDate === null));
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  const userFound = users.find((u) => u._id === id && u.deletedDate === null);

  if (!userFound) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  try {
    // const user = await User.findById({ _id: id });
    const user = await User.findById(id);
    if (!user || user.deletedDate !== null) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı!",
      });
    }
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err });
  }

  //   const user = users.find((u) => u._id === id && u.deletedDate === null);

  //   if (!user) {
  //     return res.status(404).json({
  //       message: "İstifadəçi tapılmadı!",
  //     });
  //   }

  //   res.json(user);
};

export const createUser = async (req, res) => {
  const body = req.body;

  if (!Object.keys(body).length > 0) {
    return res.status(400).json({
      message: "Məlumat göndərilməyib!",
    });
  }
  if (!body.username || !body.email || !body.password) {
    return res.status(400).json({
      message: "Məlumatlar tam doldurulmayıb!",
    });
  }

  if (
    users.findIndex(
      (item) =>
        (item.username === body.username || item.email === body.email) &&
        item.deletedDate === null
    ) !== -1
  ) {
    return res.status(409).json({
      message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
    });
  }

  const user = new User({
    username: body.username,
    email: body.email,
    password: body.password,
  });

  try {
    const savedUser = await user.save();
    users.push(savedUser);
    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    res.status(201).json({
      message: `${body.username} adlı istifadəçi elave edildi`,
    });
  } catch (error) {
    res.json({ message: error });
  }
};

export const editUser = async (req, res) => {
  const { id } = req.params;

  if (!Object.keys(req.body).length > 0) {
    return res.status(400).json({
      message: "Məlumat göndərilməyib!",
    });
  }
  const { username, email, password } = req.body;

  if (!(username || email || password)) {
    return res.status(400).json({
      message: "Duzgun məlumat göndərilməyib!",
    });
  }

  const userFound = users.find((u) => u._id === id && u.deletedDate === null);

  console.log(userFound, ">>>userFound");

  if (!userFound) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  try {
    const user = await User.updateOne(
      { _id: id },
      { $set: { username: username, email: email, password: password } }
    );

    console.log(user, ">>>user");

    if (!user) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı!",
      });
    }

    if (username) userFound.username = username;
    if (email) userFound.email = email;
    if (password) userFound.password = password;

    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    res.status(200).json({
      message: `${userFound.username} adlı istifadəçi yeniləndi`,
    });
  } catch (error) {
    res.json(error);
  }

  //   if (!user) {
  //     return res.status(404).json({
  //       message: "İstifadəçi tapılmadı!",
  //     });
  //   }

  //   if (
  //     users.findIndex(
  //       (item) =>
  //         (item.username === username || item.email === email) &&
  //         item.deletedDate === null &&
  //         item.id !== id
  //     ) !== -1
  //   ) {
  //     return res.status(409).json({
  //       message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
  //     });
  //   }

  //   if (username) user.username = username;
  //   if (email) user.email = email;
  //   if (password) user.password = password;

  //   fs.writeFileSync(`data/users.json`, JSON.stringify(users));

  //   return res.status(200).json({
  //     message: `${user.username} adlı istifadəçi yeniləndi`,
  //   });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  //   try {
  //     const deletedUser = await User.remove({ _id: id });
  //     res.send(deletedUser);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ message: error });
  //   }

  const userFound = users.find((u) => u._id === id && u.deletedDate === null);

  if (!userFound) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  try {
    const user = await User.updateOne(
      { _id: id },
      { $set: { deletedDate: new Date() } }
    );

    if (!user) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı!",
      });
    }

    userFound.deletedDate = new Date();

    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    res.status(200).json({
      message: `${userFound.username} adlı istifadəçi silindi`,
    });
  } catch (error) {
    console.log("error oldu deletede");
    res.json({ message: error });
  }

  //   return res.status(200).json({
  //     message: `${userFound.username} adlı istifadəçi silindi`,
  //   });
};

function addZero(x, n) {
  while (x.toString().length < n) {
    x = "0" + x;
  }
  return x;
}

function getTimeId(d = new Date()) {
  let y = d.getFullYear();
  let ma = addZero(d.getMonth() + 1, 2);
  let dy = addZero(d.getDate(), 2);
  let h = addZero(d.getHours(), 2);
  let mi = addZero(d.getMinutes(), 2);
  let s = addZero(d.getSeconds(), 2);
  let ms = addZero(d.getMilliseconds(), 3);
  return `${y}${ma}${dy}${h}${mi}${s}${ms}`;
}
