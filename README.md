---

# To-Do API with Authentication

A **powerful and scalable RESTful API** for managing a user's to-do list, with **secure authentication** and **PostgreSQL data persistence**.

---

## Features

* **User Authentication** — Secure registration and login with JWT.
* **Password Hashing** — Passwords are securely stored using bcryptjs to prevent plain-text exposure.
* **To-Do CRUD** — Create, Read, Update, Delete items.
* **User-Specific Data** — Each user can only manage their own tasks.
* **Pagination & Filtering** — The /todos endpoint supports pagination and filtering by completion status.
* **Environment Config** — Uses dotenv for secrets and credentials.

---

## Tech Stack

| Technology           | Purpose                     |
| -------------------- | --------------------------- |
| Node.js + Express.js | Server & routing            |
| PostgreSQL           | Data storage                |
| pg                   | PostgreSQL client           |
| bcryptjs             | Password hashing            |
| jsonwebtoken         | JWT creation & verification |
| dotenv               | Env variable management     |

---

## Prerequisites

* **Node.js & npm**
* **PostgreSQL** with `psql` CLI

---

## Installation & Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd todo-api-with-auth-pg
npm install
```

### 2. Database Setup

```sql
CREATE DATABASE todo_auth_db;
CREATE USER todo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE todo_auth_db TO todo_user;
```

### 3. Create Tables

```bash
psql -U todo_user -d todo_auth_db -f database/init.sql
```

### 4. Configure `.env`

```env
DB_USER=todo_user
DB_HOST=localhost
DB_NAME=todo_auth_db
DB_PASSWORD=your_secure_password
DB_PORT=5432
JWT_SECRET=your_long_and_complex_secret_key
PORT=3000
```

Generate a JWT secret:

```bash
openssl rand -base64 32
```

---

## Run the Server

```bash
npm start
```

Server runs on **[http://localhost:3000](http://localhost:3000)**

---

## API Endpoints

All routes are prefixed with:
`http://localhost:3000/api`

### Authentication `/api/auth`

| Method | Path        | Description     | Body Example                                                                         |
| ------ | ----------- | --------------- | ------------------------------------------------------------------------------------ |
| POST   | `/register` | Register a user | `{ "name": "John Doe", "email": "j.doe@example.com", "password": "securepassword" }` |
| POST   | `/login`    | Login & get JWT | `{ "email": "j.doe@example.com", "password": "securepassword" }`                     |

---

### To-Do `/api/todos` *(JWT required)*

| Method | Path   | Description   | Example                                                            |
| ------ | ------ | ------------- | ------------------------------------------------------------------ |
| POST   | `/`    | Create to-do  | `{ "title": "Buy groceries", "description": "Milk, bread, eggs" }` |
| GET    | `/`    | Get all todos | `?page=1&limit=10&completed=true`                                  |
| PUT    | `/:id` | Update to-do  | `{ "title": "Buy milk", "completed": true }`                       |
| DELETE | `/:id` | Delete to-do  | —                                                                  |

---

## Project Structure

```
todo-api-with-auth-pg/
├── .env
├── package.json
├── server.js
├── config/
│   └── db.config.js
├── database/
│   ├── init.sql
│   └── index.js
├── controllers/
│   ├── auth.controller.js
│   └── todo.controller.js
├── middleware/
│   └── auth.middleware.js
└── routes/
    ├── auth.routes.js
    └── todo.routes.js
```

---

## Troubleshooting

* **ECONNREFUSED** — DB server not running.
* **500 Internal Server Error** — Check server logs.
* **401 Unauthorized** — Missing/invalid JWT.
  Format header as:

  ```
  Authorization: Bearer <token>
  ```

---

