const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

dotenv.config({
  path: ".env",
});

const Todo = require("./model/todoModel");
const User = require("./model/userModel");
const {
  addTodo,
  fetchTodo,
  editTodo,
  deleteTodo,
} = require("./controllers/todo.controller");

mongoose.connect(process.env.MONGO_URL);
const jwtSecrets = process.env.JWT_SECRETS;
const bcryptSalt = bcrypt.genSaltSync(10);

const server = express();
server.use(cors());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieParser());
server.set("port", process.env.PORT || 5000);

// Authentication
server.post("/register", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

  try {
    const registerUser = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const token = jwt.sign({ _id: registerUser._id, username }, jwtSecrets);
    console.log(token);
    res
      .cookie({ token: token })
      .status(201)
      .json({ message: "User Created", info: registerUser });
  } catch (err) {
    console.log(err);
  }
});

server.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExist = await User.findOne({ username });

    if (userExist) {
      const passVerified = bcrypt.compareSync(password, userExist.password);

      if (passVerified) {
        const token = jwt.sign({ _id: userExist._id, username }, jwtSecrets);
        console.log(token);
        res.cookie("token", token).status(201).json({ _id: userExist._id });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

server.post("/logout", async (req, res) => {
  res.cookie("token", "").json({ message: "logout" });
});

// Todo
server.put("/add-todo", addTodo);

server.get("/my-todo", fetchTodo);

server.patch("/edit-todo", editTodo);

server.delete("/delete-todo", deleteTodo);

server.listen(server.get("port"), () => {
  console.log(`---SERVER LISTENING TO PORT ${server.get("port")}---`);
});
