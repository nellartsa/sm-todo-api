const jwt = require("jsonwebtoken");
const Todo = require("../model/todoModel");

const jwtSecrets = process.env.JWT_SECRETS;

const addTodo = async (req, res) => {
  const { agenda } = req.body;
  const { token } = req.cookies;
  const { _id: userId } = jwt.verify(token, jwtSecrets);

  try {
    await Todo.create({
      owner: userId,
      agenda,
    });

    res.status(200).json({ message: "1 Item Added" });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const fetchTodo = async (req, res) => {
  const { token } = req.cookies;
  const { _id: userId } = jwt.verify(token, jwtSecrets);

  try {
    const userTodos = await Todo.find({
      owner: { $in: userId },
    });

    res.status(200).json(userTodos);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const editTodo = async (req, res) => {
  const { todoId, agenda } = req.body;

  console.log(todoId, agenda);
  try {
    await Todo.updateMany({ _id: todoId }, { agenda: agenda });

    res.status(200).json({ message: "Edited 1 Item" });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const deleteTodo = async (req, res) => {
  const { todoId } = req.body;

  try {
    const todo = await Todo.findById(todoId);
    await Todo.deleteOne({ _id: todo._id });

    res.status(200).json({ message: "1 Item Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

module.exports = { addTodo, fetchTodo, editTodo, deleteTodo };
