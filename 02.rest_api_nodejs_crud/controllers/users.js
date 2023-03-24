import { v4 as uuidv4 } from "uuid";
import fs from "fs";

let users = [];

try {
  users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
} catch (error) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/users.json", JSON.stringify([]));
}

export const getUsersAll = (req, res) => {
  res.send(users);
};

export const getUsers = (req, res) => {
  res.send(users.filter((u) => u.deletedDate === null));
};

export const getUser = (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id && u.deletedDate === null);

  if (!user) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  res.json(user);
};

export const createUser = (req, res) => {
  const user = req.body;

  if (!Object.keys(user).length > 0) {
    return res.status(400).json({
      message: "Məlumat göndərilməyib!",
    });
  }
  if (!user.username || !user.email || !user.password) {
    return res.status(400).json({
      message: "Məlumatlar tam doldurulmayıb!",
    });
  }

  if (
    users.findIndex(
      (item) =>
        (item.username === user.username || item.email === user.email) &&
        item.deletedDate === null
    ) !== -1
  ) {
    return res.status(409).json({
      message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
    });
  }

  users.push({
    ...user,
    id: getTimeId() + "_" + uuidv4(),
    cretedDate: new Date(),
    deletedDate: null,
  });

  fs.writeFileSync(`data/users.json`, JSON.stringify(users));

  res.status(201).json({
    message: `${user.username} adlı istifadəçi elave edildi`,
  });
};

export const editUser = (req, res) => {
  const { id } = req.params;

  if (!Object.keys(req.body).length > 0) {
    return res.status(400).json({
      message: "Məlumat göndərilməyib!",
    });
  }
  const { username, email, password } = req.body;
  const user = users.find((u) => u.id === id && u.deletedDate === null);

  if (!user) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  if (!(username || email || password)) {
    return res.status(400).json({
      message: "Duzgun məlumat göndərilməyib!",
    });
  }

  if (
    users.findIndex(
      (item) =>
        (item.username === username || item.email === email) &&
        item.deletedDate === null &&
        item.id !== id
    ) !== -1
  ) {
    return res.status(409).json({
      message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
    });
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;

  fs.writeFileSync(`data/users.json`, JSON.stringify(users));

  return res.status(200).json({
    message: `${user.username} adlı istifadəçi yeniləndi`,
  });
};

export const deleteUser = (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id && u.deletedDate === null);

  if (!user) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  user.deletedDate = new Date();

  fs.writeFileSync(`data/users.json`, JSON.stringify(users));

  return res.status(200).json({
    message: `${user.username} adlı istifadəçi silindi`,
  });
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
