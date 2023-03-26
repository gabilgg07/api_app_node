// import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import User from "../models/User.js";

let users = [];

try {
  users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
} catch (error) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/users.json", JSON.stringify([]));
}

const addDbUser = async (u) => {
  const user = new User({
    _id: u._id,
    username: u.username,
    email: u.email,
    password: u.password,
    createdDate: u.createdDate,
    deletedDate: u.deletedDate,
    modifiedDate: u.modifiedDate,
  });

  try {
    const savedUser = await user.save();

    //#region other way change _id
    // store the document in a variable
    // let doc = await User.findOne({ _id: savedUser._id });

    // // set a new _id on the document
    // doc._id = u._id;

    // // insert the document, using the new _id
    // const iU = await User.insertMany(doc);

    // // remove the document with the old _id
    // const rU = await User.findByIdAndRemove({ _id: savedUser._id });
    //#endregion

    console.log(`${savedUser.username} adlı istifadəçi elave edildi`);
  } catch (error) {
    console.log("\n<>error-addDbUser<>\n", error, "\n");
  }
};

const modifiedFoundUser = async (u, isFromDb) => {
  const user = {
    username: u.username,
    email: u.email,
    password: u.password,
    createdDate: u.createdDate,
    deletedDate: u.deletedDate,
    modifiedDate: u.modifiedDate,
  };

  if (isFromDb) {
    let lUser = users.find((lU) => lU._id === u._id);
    lUser = {
      ...lUser,
      ...user,
    };

    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    console.log(`Local-da ${user.username} deyisildi:${u._id}`);
  } else {
    // console.log(user, "><user");
    try {
      const us = await User.updateOne(
        { _id: u._id },
        {
          $set: user,
        }
      );

      console.log(`DB-da ${user.username} deyisildi:${u._id}`);
    } catch (error) {
      console.log(error, "><error");
    }
  }
};

const getUsersForDb = async () => {
  try {
    const db = await User.find();

    if (users.length > 0) {
      users.forEach((u) => {
        if (!db.some((user) => user._id.toString() === u._id)) {
          addDbUser(u);
        }
        const foundU = db.find((item) => item._id.toString() === u._id);

        if (foundU) {
          const foundUMD = new Date(foundU.modifiedDate);
          const userMD = new Date(u.modifiedDate);

          const isFromDb = userMD.getTime() < foundUMD.getTime();

          if (foundUMD.getTime() !== userMD.getTime()) {
            modifiedFoundUser(isFromDb ? foundU : u, isFromDb);
          }
        }
      });
    } else if (db.length > 0) {
      users = db;
      fs.writeFileSync(`data/users.json`, JSON.stringify(users));
    }
  } catch (error) {
    console.log("\n<>error-getUsersForDb<>\n", error, "\n");
  }
};

getUsersForDb();

export const getUsersAll = async (req, res) => {
  try {
    const usersDb = await User.find();
    res.send({
      userInfo: req.user,
      users: usersDb,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }

  //#region old style
  //   res.send(users);
  //#endregion
};

export const getUsers = async (req, res) => {
  try {
    const usersDb = await User.find({ deletedDate: null });
    res.send(usersDb);
  } catch (err) {
    res.status(500).json({ message: err });
  }

  //#region old style
  //   res.send(users.filter((u) => u.deletedDate === null));
  //#endregion
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  const userFound = users.find((u) => u._id === id && u.deletedDate === null);

  if (!userFound) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
      inLocal: true,
    });
  }

  try {
    // const user = await User.findById({ _id: id });
    const user = await User.findById(id);

    console.log(user);

    if (!user || user.deletedDate !== null) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı!",
      });
    }
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err });
  }

  //#region old style
  //   const user = users.find((u) => u._id === id && u.deletedDate === null);

  //   if (!user) {
  //     return res.status(404).json({
  //       message: "İstifadəçi tapılmadı!",
  //     });
  //   }

  //   res.json(user);
  //#endregion
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

  try {
    const found = await User.findOne()
      .and({ deletedDate: null })
      .or({ username: body.username })
      .or({ email: body.email });

    console.log("\n Found: \n", found, "\n");

    if (found) {
      return res.status(404).json({
        message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
      });
    }
  } catch (error) {
    console.log("\nerror<found", error);
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
    console.log("\nerror create:\n", error);
    res.json({ message: "Istifadeci yaranmadi!!!" });
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
    const found = await User.findOne()
      .nor({ _id: id })
      .and({ deletedDate: null })
      .or({ username: username })
      .or({ email: email });

    console.log("\n Found: \n", found, "\n");

    if (found) {
      return res.status(404).json({
        message: "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
      });
    }
  } catch (error) {
    console.log("\nerror<found", error);
  }

  try {
    const user = await User.updateOne(
      { _id: id },
      {
        $set: {
          username: username,
          email: email,
          password: password,
          modifiedDate: new Date(),
        },
      }
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
    userFound.modifiedDate = new Date();

    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    res.status(200).json({
      message: `${userFound.username} adlı istifadəçi yeniləndi`,
    });
  } catch (error) {
    res.json(error);
  }

  //#region old style
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

  //#endregion
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  //#region old style
  //   try {
  //     const deletedUser = await User.remove({ _id: id });
  //     res.send(deletedUser);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ message: error });
  //   }
  //#endregion

  const userFound = users.find((u) => u._id === id && u.deletedDate === null);

  if (!userFound) {
    return res.status(404).json({
      message: "İstifadəçi tapılmadı!",
    });
  }

  try {
    const user = await User.updateOne(
      { _id: id },
      { $set: { deletedDate: new Date(), modifiedDate: new Date() } }
    );

    if (!user) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı!",
      });
    }

    userFound.deletedDate = new Date();
    userFound.modifiedDate = new Date();

    fs.writeFileSync(`data/users.json`, JSON.stringify(users));

    res.status(200).json({
      message: `${userFound.username} adlı istifadəçi silindi`,
    });
  } catch (error) {
    console.log("error oldu deletede");
    res.json({ message: error });
  }

  //#region old style
  //   return res.status(200).json({
  //     message: `${userFound.username} adlı istifadəçi silindi`,
  //   });
  //#endregion
};

//#region old style

// function addZero(x, n) {
//   while (x.toString().length < n) {
//     x = "0" + x;
//   }
//   return x;
// }

// function getTimeId(d = new Date()) {
//   let y = d.getFullYear();
//   let ma = addZero(d.getMonth() + 1, 2);
//   let dy = addZero(d.getDate(), 2);
//   let h = addZero(d.getHours(), 2);
//   let mi = addZero(d.getMinutes(), 2);
//   let s = addZero(d.getSeconds(), 2);
//   let ms = addZero(d.getMilliseconds(), 3);
//   return `${y}${ma}${dy}${h}${mi}${s}${ms}`;
// }

//#endregion
