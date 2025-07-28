const express = require("express");
const router = express.Router();
const todoController = require("../controller/todo.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware); // Apply middleware to all todo routes

router.post("/", todoController.createTodo);
router.get("/", todoController.getTodos);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
