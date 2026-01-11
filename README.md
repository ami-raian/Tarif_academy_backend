# 🎓 TarifAcademy Backend API

A robust REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** using a modular architecture.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Response Format](#-response-format)

---

## ✨ Features

- ✅ Modular folder structure (Feature-based)
- ✅ TypeScript for type safety
- ✅ RESTful API design
- ✅ MongoDB with Mongoose ODM
- ✅ Centralized error handling
- ✅ Standardized API responses
- ✅ Pagination support
- ✅ CORS enabled

---

## 🛠 Tech Stack

| Technology | Description          |
| ---------- | -------------------- |
| Node.js    | Runtime environment  |
| Express.js | Web framework        |
| TypeScript | Type-safe JavaScript |
| MongoDB    | NoSQL database       |
| Mongoose   | MongoDB ODM          |

---

## 📁 Project Structure

```
tarifacademy-backend/
│
├── server.ts                      # Entry point
├── package.json
├── tsconfig.json
├── .env                           # Environment variables
│
└── src/
    ├── app.ts                     # Express app configuration
    │
    ├── config/
    │   └── database.ts            # MongoDB connection
    │
    ├── modules/                   # Feature-based modules
    │   │
    │   ├── user/                  # 👤 User Module
    │   │   ├── user.interface.ts  # TypeScript interfaces
    │   │   ├── user.model.ts      # Mongoose schema
    │   │   ├── user.service.ts    # Business logic
    │   │   ├── user.controller.ts # Request handlers
    │   │   ├── user.routes.ts     # Route definitions
    │   │   └── index.ts           # Module exports
    │   │
    │   └── course/                # 📚 Course Module
    │       ├── course.interface.ts
    │       ├── course.model.ts
    │       ├── course.service.ts
    │       ├── course.controller.ts
    │       ├── course.routes.ts
    │       └── index.ts
    │
    ├── routes/
    │   └── index.ts               # Central route handler
    │
    └── shared/                    # Shared utilities
        ├── middleware/
        │   └── errorHandler.ts
        ├── utils/
        │   ├── apiResponse.ts     # Response helpers
        │   └── asyncHandler.ts
        └── index.ts
```

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tarifacademy-backend.git

# Navigate to project
cd tarifacademy-backend

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tarifacademy
NODE_ENV=development
API_VERSION=v1
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

---

### 👤 User Endpoints

| Method   | Endpoint     | Description                     |
| -------- | ------------ | ------------------------------- |
| `GET`    | `/users`     | Get all users (with pagination) |
| `GET`    | `/users/:id` | Get user by ID                  |
| `POST`   | `/users`     | Create new user                 |
| `PUT`    | `/users/:id` | Update user                     |
| `DELETE` | `/users/:id` | Delete user                     |

#### Query Parameters (GET /users)

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

---

### 📚 Course Endpoints

| Method   | Endpoint                            | Description                    |
| -------- | ----------------------------------- | ------------------------------ |
| `GET`    | `/courses`                          | Get all courses (with filters) |
| `GET`    | `/courses/:id`                      | Get course by ID               |
| `GET`    | `/courses/slug/:slug`               | Get course by slug             |
| `GET`    | `/courses/instructor/:instructorId` | Get courses by instructor      |
| `POST`   | `/courses`                          | Create new course              |
| `PUT`    | `/courses/:id`                      | Update course                  |
| `DELETE` | `/courses/:id`                      | Delete course                  |
| `PATCH`  | `/courses/:id/publish`              | Toggle publish status          |

#### Query Parameters (GET /courses)

| Parameter  | Type   | Default | Description                                      |
| ---------- | ------ | ------- | ------------------------------------------------ |
| `page`     | number | 1       | Page number                                      |
| `limit`    | number | 10      | Items per page                                   |
| `category` | string | -       | Filter by category                               |
| `level`    | string | -       | Filter by level (beginner/intermediate/advanced) |
| `search`   | string | -       | Search in title & description                    |

---

## 📤 Response Format

### ✅ Success Response (Single Item)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### ✅ Success Response (With Pagination)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [
    { "_id": "...", "name": "John Doe" },
    { "_id": "...", "name": "Jane Doe" }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

### ✅ Created Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

### ❌ Validation Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Email already exists"
}
```

---

## 📝 License

MIT © TarifAcademy

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">Made with ❤️ by TarifAcademy Team</p>
