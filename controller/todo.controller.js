const db = require("../database");

// Create todo item
exports.createTodo = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId; // got it from JWT by authMiddleware

  try {
    const insertTodoQuery = `
            INSERT INTO todos (user_id, title, description)
            VALUES ($1, $2, $3) RETURNING id, title, description, completed, user_id;
        `;
    const result = await db.query(insertTodoQuery, [
      userId,
      title,
      description,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating todo" });
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  const userId = req.userId;

  try {
    // Ensure the user owns the todo before updating
    const findTodoQuery = "SELECT user_id FROM todos WHERE id = $1";
    const todoResult = await db.query(findTodoQuery, [id]);
    const todo = todoResult.rows[0];

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    if (todo.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not authorized to update this todo" });
    }

    const updateTodoQuery = `
            UPDATE todos
            SET title = COALESCE($1, title), 
                description = COALESCE($2, description), 
                completed = COALESCE($3, completed), 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 
            RETURNING id, title, description, completed, user_id;
        `;
    const updatedResult = await db.query(updateTodoQuery, [
      title,
      description,
      completed,
      id,
    ]);

    res.json(updatedResult.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating todo" });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Delete only if owned by the user
    const deleteTodoQuery =
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id;";
    const result = await db.query(deleteTodoQuery, [id, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Todo not found or unauthorized" });
    }

    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: "Error deleting todo" });
  }
};

// Get todo items - Pagination and Filtering
exports.getTodos = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // get total count for pagination metadata
    const countQuery = "SELECT COUNT(*) FROM todos WHERE user_id = $1;";
    const totalResult = await db.query(countQuery, [userId]);
    const total = parseInt(totalResult.rows[0].count, 10);

    // get paginated and filtered todos
    let todosQuery =
      "SELECT id, title, description, completed FROM todos WHERE user_id = $1 ";
    let queryParams = [userId];
    let paramIndex = 2; // Start index for dynamic parameters

    // Filtering by 'completed' status
    if (req.query.completed !== undefined) {
      const completed = req.query.completed === "true";
      todosQuery += `AND completed = $${paramIndex++} `;
      queryParams.push(completed);
    }

    // Sorting example
    if (req.query.sortBy) {
      const [sortField, sortOrder] = req.query.sortBy.split(":");
      const allowedSortFields = ["created_at", "title", "completed"];
      // Crucial: Sanitize dynamic sort field to prevent SQL injection
      if (allowedSortFields.includes(sortField)) {
        todosQuery += `ORDER BY ${sortField} ${
          sortOrder === "desc" ? "DESC" : "ASC"
        } `;
      }
    } else {
      todosQuery += "ORDER BY created_at DESC "; // Default sort
    }

    // Add LIMIT and OFFSET for pagination
    todosQuery += `LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
    queryParams.push(limit, offset);

    const dataResult = await db.query(todosQuery, queryParams);

    res.json({
      data: dataResult.rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Todos Error:", error);
    res.status(500).json({ message: "Error fetching todos" });
  }
};
