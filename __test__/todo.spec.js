const {
  addTodo,
  fetchTodo,
  editTodo,
  deleteTodo,
} = require("../controllers/todo.controller");
const jwt = require("jsonwebtoken");
const Todo = require("../model/todoModel");

jest.mock("jsonwebtoken");
jest.mock("../model/todoModel");

describe("addTodo", () => {
  test("should add a new todo item and return a success message", async () => {
    const req = {
      body: {
        agenda: "Test Agenda",
      },
      cookies: {
        token: "test-token",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserId = "test-user-id";
    jwt.verify.mockReturnValueOnce({ _id: mockUserId });

    await addTodo(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      req.cookies.token,
      process.env.JWT_SECRETS
    );
    expect(Todo.create).toHaveBeenCalledWith({
      owner: mockUserId,
      agenda: req.body.agenda,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "1 Item Added" });
  });

  test("should return a 500 status code if an error occurs", async () => {
    const req = {
      body: {
        agenda: "Test Agenda",
      },
      cookies: {
        token: "test-token",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserId = "test-user-id";
    jwt.verify.mockReturnValueOnce({ _id: mockUserId });

    const mockError = new Error("Test Error");
    Todo.create.mockRejectedValueOnce(mockError);

    await addTodo(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      req.cookies.token,
      process.env.JWT_SECRETS
    );
    expect(Todo.create).toHaveBeenCalledWith({
      owner: expect.any(String),
      agenda: req.body.agenda,
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("fetchTodo", () => {
  test("should return all todo of the user with token", async () => {
    const req = {
      cookies: {
        token: "test-token",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserId = "test-user-id";
    jwt.verify.mockReturnValueOnce({ _id: mockUserId });

    const userTodos = await fetchTodo(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      req.cookies.token,
      process.env.JWT_SECRETS
    );
    expect(Todo.find).toHaveBeenCalledWith({
      owner: { $in: mockUserId },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(userTodos);
  });

  test("should return a 500 status code if an error occurs", async () => {
    const req = {
      cookies: {
        token: "test-token",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserId = "test-user-id";
    jwt.verify.mockReturnValueOnce({ _id: mockUserId });
    Todo.find.mockRejectedValue(new Error("Test Error"));

    const userTodos = await fetchTodo(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      req.cookies.token,
      process.env.JWT_SECRETS
    );
    expect(Todo.find).toHaveBeenCalledWith({
      owner: { $in: mockUserId },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).not.toHaveBeenCalledWith(userTodos);
  });
});

describe("editTodo", () => {
  test("should update selected todo and return a success message", async () => {
    const req = {
      body: {
        todoId: "todo-test-id",
        agenda: "Test Agenda",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await editTodo(req, res);

    expect(Todo.updateMany).toHaveBeenCalledWith(
      { _id: req.body.todoId },
      { agenda: req.body.agenda }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Edited 1 Item" });
  });

  test("should return a 500 status code if an error occurs", async () => {
    const req = {
      body: {
        todoId: "todo-test-id",
        agenda: "Test Agenda",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Todo.updateMany.mockRejectedValue(new Error("Test Error"));

    await editTodo(req, res);

    expect(Todo.updateMany).toHaveBeenCalledWith(
      { _id: req.body.todoId },
      { agenda: req.body.agenda }
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).not.toHaveBeenCalledWith();
  });
});

describe("deleteTodo", () => {
  test("should delete selected todo and return a success message", async () => {
    const req = {
      body: {
        todoId: "todo-test-id",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockTodo = {
      _id: req.body.todoId,
    };
    Todo.findById.mockResolvedValue(mockTodo);

    await deleteTodo(req, res);

    expect(Todo.findById).toHaveBeenCalledWith(req.body.todoId);
    expect(Todo.deleteOne).toHaveBeenCalledWith({ _id: req.body.todoId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "1 Item Deleted" });
  });

  test("should return a 500 status code if an error occurs", async () => {
    const req = {
      body: {
        todoId: "todo-test-id",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Todo.findById.mockRejectedValue(new Error("Test Error"));

    await deleteTodo(req, res);

    expect(Todo.findById).toHaveBeenCalledWith(req.body.todoId);
    expect(Todo.deleteOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).not.toHaveBeenCalled();
  });
});
