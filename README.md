# 🚀 User Management Service

A robust REST API service built with NestJS for managing users with role-based authentication and authorization.

## 📝 Description

This service provides a complete user management system with features including:

- 🔐 User authentication (signup/signin)
- 👥 Role-based access control (Admin/User roles)
- 🎫 JWT-based authentication
- ⚡ User CRUD operations with pagination
- ✉️ Email uniqueness validation
- 🔒 Secure password handling
- 💾 Database transaction support
- ⚠️ Comprehensive error handling

## 🔧 Prerequisites

Before running this service, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker & Docker Compose (for development database and tests)

> 💡 You can either use a local MySQL installation or run it via Docker Compose (recommended).

## 🐳 Docker Database Setup

You can quickly spin up a MySQL database using Docker Compose:

```bash
# Start MySQL container
npm run docker:db:up

# Stop MySQL container
npm run docker:db:down

# View MySQL container logs
npm run docker:db:logs
```

The MySQL container will be available at:
- Host: localhost
- Port: 3306
- Username: root
- Password: root_password
- Database: dev_db

> 💡 Make sure you have Docker and Docker Compose installed on your machine.

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd user-management-service
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Then update the `.env` file with your configuration.

## 🗃️ Database Management

### Migrations

Generate a new migration:

```bash
npm run migration:generate -- src/migrations/MigrationName
```

Run pending migrations:

```bash
npm run migration:run
```

Revert last migration:

```bash
npm run migration:revert
```

### Seeding Data

Seed the database with initial data:

```bash
npm run seed
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Starts the application in development mode |
| `npm run start:dev` | Starts the application with hot-reload enabled |
| `npm run start:prod` | Starts the application in production mode |
| `npm run build` | Builds the application |
| `npm run test` | Runs end-to-end tests (requires Docker) |
| `npm run test:cov` | Runs tests with coverage reporting |
| `npm run lint` | Lints the codebase |
| `npm run format` | Formats the codebase using Prettier |
| `npm run migration:generate` | Generates a new migration file |
| `npm run migration:run` | Runs database migrations |
| `npm run migration:revert` | Reverts the last database migration |
| `npm run seed` | Seeds the database with initial data |

## 🔐 Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=your_database

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

## 📚 API Documentation

The API documentation is available at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) when running the service. It's built using Swagger/OpenAPI.

> 💡 Make sure the service is running locally to access the API documentation.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/auth/signup` | Register new user | No | None |
| POST | `/auth/signin` | Authenticate user | No | None |

#### Request Body (signup)

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin"
}
```

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | List all users with pagination | Yes | Admin |
| GET | `/users/me` | Get current user profile | Yes | Any |
| GET | `/users/:id` | Get specific user profile | Yes | Admin |
| PATCH | `/users/:id` | Update user | Yes | Admin/Self |
| DELETE | `/users/:id` | Delete user | Yes | Admin |

#### Query Parameters (GET /users)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

#### Update User Body

```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "role": "user|admin (admin only)"
}
```

## 🧪 Testing

The project includes both unit tests and end-to-end tests. The e2e tests use Docker to spin up a test MySQL database.

To run all tests:

```bash
npm run test:e2e
```

For test coverage:

```bash
npm run test:cov
```

## 📁 Project Structure

```bash

src/
├── app/
│   ├── controllers/    # 🎮 Route controllers
│   └── domains/       # 💼 Business logic and domain models
├── common/            # 🔧 Shared utilities, guards, and decorators
├── migrations/        # 📊 Database migrations
├── seeds/            # 🌱 Seeds the database with data
└── main.ts           # 🎯 Application entry point
```

## 👨‍💻 Author

Jude Okafor

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
