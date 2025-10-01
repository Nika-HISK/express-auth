# Express.js Authentication Service

This is a complete authentication service built with **Express.js**, **MySQL**, and **Sequelize ORM**. It includes user registration, login, and logout with **JWT-based authentication**, along with input validation using **Joi** and comprehensive security features.

## Features

- User registration & login
- **Secure logout with token blacklisting**
- JWT access token generation
- Secure password hashing with bcrypt
- Input validation using Joi
- **Automatic cleanup of expired tokens**
- Role-based access control (USER/ADMIN)
- User management (CRUD operations)
- Ban/Unban functionality
- Comprehensive error handling
- Security middleware (helmet, cors, rate limiting)
- Soft deletes with Sequelize paranoid mode

## Tech Stack

- **Express.js** – Fast, unopinionated web framework
- **Sequelize** – Promise-based ORM for MySQL
- **MySQL** – Relational database for user storage
- **JWT** – JSON Web Tokens for authentication
- **Joi** – Object schema validation
- **bcrypt** – Password hashing
- **node-cron** – For automated token cleanup

## Installation & Setup

```bash
git clone https://github.com/Nika-HISK/express-auth.git
cd express-authentication-service

npm install

# Copy environment file
cp .env.example .env

# Configure your .env file with database credentials and JWT secret

# Start development server
npm run dev

# Or start production server
npm start
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASS=your_password
DB_NAME=express_auth_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_ACCESS_EXP=1h
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

#### Admin Login
```http
POST /auth/login/admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <your-jwt-token>
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <your-jwt-token>
```

### User Management

#### Get All Users (Admin only)
```http
GET /users?page=1&limit=10&role=User&banned=false
Authorization: Bearer <admin-jwt-token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <your-jwt-token>
```

#### Update User
```http
PATCH /users/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "username": "newusername"
}
```

#### Delete User (Admin only)
```http
DELETE /users/:id
Authorization: Bearer <admin-jwt-token>
```

#### Ban User (Admin only)
```http
PATCH /users/:id/ban
Authorization: Bearer <admin-jwt-token>
```

#### Unban User (Admin only)
```http
PATCH /users/:id/unban
Authorization: Bearer <admin-jwt-token>
```

## Authentication Flow

### **Login Process**
1. User provides email and password
2. System validates credentials against database
3. JWT token is generated and returned with user info
4. Client stores token for future requests

### **Protected Requests**
1. Client sends token in `Authorization: Bearer <token>` header
2. Middleware validates token signature and expiration
3. **Checks if token is blacklisted (logout protection)**
4. Verifies user exists and isn't banned
5. Validates user roles for endpoint access
6. Grants or denies access

### **Logout Process**
1. Client sends authenticated logout request
2. System extracts token from authorization header
3. **Token is added to blacklist with expiration time**
4. Future requests with this token are rejected
5. **Expired blacklisted tokens are automatically cleaned up daily**

## Security Features

- **Immediate Token Invalidation**: Logout instantly invalidates tokens
- **Password Security**: Uses bcrypt with configurable salt rounds
- **Token Blacklisting**: Prevents reuse of logged-out tokens
- **Role-Based Access Control**: USER and ADMIN role separation
- **Input Validation**: Comprehensive validation using Joi schemas
- **Ban System**: Banned users cannot access protected resources
- **Rate Limiting**: Prevents abuse with configurable limits
- **Security Headers**: Helmet middleware for security headers
- **CORS Protection**: Configurable CORS policy
- **Automatic Cleanup**: Daily cleanup of expired tokens

## Testing the API

### Complete Test Flow:

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

2. **Login to get token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

3. **Test protected route (should work):**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **Logout:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

5. **Test protected route again (should fail):**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result:** Step 5 should return `401 Unauthorized` with message "Token has been invalidated"

## Project Structure

```
src/
├── config/
│   └── database.js              # Database configuration
├── middleware/
│   ├── auth.js                  # Authentication & authorization
│   ├── errorHandler.js          # Error handling middleware
│   └── validation.js            # Request validation middleware
├── models/
│   ├── User.js                  # User model with Sequelize
│   └── TokenBlacklist.js        # Token blacklist model
├── routes/
│   ├── auth.js                  # Authentication routes
│   └── users.js                 # User management routes
├── services/
│   ├── authService.js           # Authentication business logic
│   ├── userService.js           # User management logic
│   └── tokenBlacklistService.js # Token blacklisting & cleanup
├── validation/
│   └── schemas.js               # Joi validation schemas
└── app.js                       # Main application file
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
