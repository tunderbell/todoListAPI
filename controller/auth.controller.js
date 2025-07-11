const bycryotjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const db = require("../database/index");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // "$1" is a placeholder for parameterized queries to prevent SQL injection
    const checkEmailQuery = "SELECT id FROM users WHERE email = $1";
    const existingUser = await db.query(checkEmailQuery, [email]);

    if (existingUser.rows.length > 0) {
      // 409 code indicates a conflict like trying to register an email that already exists
      return res.status(409).json({ message: "Email already registered" });
    }

    //Hash passweord using imported bcryptjs library
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insert new user into the database
    const insertUserQuery = `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3) RETURNING id;
        `;
    const result = await db.query(insertUserQuery, [
      name,
      email,
      hashedPassword,
    ]);
    const userId = result.rows[0].id;

    // 4. Generate JWT
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", token, userId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email
    const findUserQuery =
      "SELECT id, password_hash FROM users WHERE email = $1";
    const result = await db.query(findUserQuery, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
