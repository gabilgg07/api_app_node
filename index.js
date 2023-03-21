const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { v4: uuid } = require("uuid");

const getusers = async () => {
  let usrs = [];
  try {
    usrs = await fs.readFile("data/users/users.json", "utf-8");
  } catch (error) {
    await fs.mkdir("data/users", { recursive: true });
    await fs.writeFile(`data/users/users.json`, JSON.stringify([]));
    // console.log(error, "error");
    return usrs;
  }

  return JSON.parse(usrs);
};

const app = express();
app.use(express.json());

getusers()
  .then((users) => {
    app.get("/users", async (req, res) => {
      res.json(users);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
    });

    app.post("/users", async (req, res) => {
      const id = getTimeId() + "_" + uuid();
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
          (item) => item.username === body.username || item.email === body.email
        ) !== -1
      ) {
        return res.status(409).json({
          message:
            "Bu istifadəçi adından və ya poçt ünvanından artıq mövcuddur!",
        });
      }

      body.id = id;

      users = [...users, body];

      await fs.mkdir("data/users", { recursive: true });
      await fs.writeFile(`data/users/users.json`, JSON.stringify(users));

      console.log(body);
      res.status(201).json({
        message: `${body.username} elave edildi`,
      });
    });

    app.listen(3000, () => console.log("API Server just runing...."));
  })
  .catch((err) => {
    console.log(err);
  });

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
