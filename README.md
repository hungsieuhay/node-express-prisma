# Authentication API with Node.js, Express, Prisma, PostgreSQL, JWT & TypeScript

A modern, secure authentication API built with the latest technologies including Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT tokens, and cookie-based authentication.

## 🚀 Features

- **User Registration & Login** - Secure user authentication
- **JWT Token Authentication** - Access and refresh token system
- **Cookie-based Security** - HttpOnly cookies for token storage
- **Password Hashing** - bcryptjs for secure password storage
- **TypeScript** - Full type safety and modern JavaScript features
- **Prisma ORM** - Modern database toolkit with type-safe queries
- **PostgreSQL** - Robust relational database
- **Security Headers** - Helmet.js for security best practices
- **CORS Support** - Cross-origin resource sharing configuration
- **Input Validation** - Request validation and sanitization
- **Error Handling** - Comprehensive error handling and logging
- **Development Tools** - Nodemon for hot reloading

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet.js, CORS
- **Development**: Nodemon, ts-node

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd auth-api-express-prisma
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db?schema=public"

# JWT Secrets (Change these in production!)
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-change-this-in-production"

# JWT Expiration
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Cookie Configuration
COOKIE_SECRET="your-super-secret-cookie-key-change-this-in-production"
```

### 4. Database Setup

#### Option A: Local PostgreSQL

1. Create a PostgreSQL database named `auth_db`
2. Update the `DATABASE_URL` in your `.env` file with your database credentials

#### Option B: Docker PostgreSQL

```bash
docker run --name postgres-auth \
  -e POSTGRES_DB=auth_db \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Generate Prisma Client & Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication Routes

| Method | Endpoint               | Description             | Access                          |
| ------ | ---------------------- | ----------------------- | ------------------------------- |
| POST   | `/api/auth/register`   | Register a new user     | Public                          |
| POST   | `/api/auth/login`      | Login user              | Public                          |
| POST   | `/api/auth/refresh`    | Refresh access token    | Public (requires refresh token) |
| POST   | `/api/auth/logout`     | Logout user             | Private                         |
| POST   | `/api/auth/logout-all` | Logout from all devices | Private                         |
| GET    | `/api/auth/profile`    | Get user profile        | Private                         |
| GET    | `/api/auth/verify`     | Verify token validity   | Private                         |

### Health Check

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

## 🔐 API Usage Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Get Profile (with cookie authentication)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Cookie: accessToken=your_access_token_here"
```

### Get Profile (with Authorization header)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer your_access_token_here"
```

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  refreshTokens RefreshToken[]
}
```

### RefreshToken Model

```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Separate access and refresh tokens
- **HttpOnly Cookies**: Secure token storage
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers and protections
- **Input Validation**: Request validation and sanitization
- **Token Expiration**: Configurable token lifetimes
- **Refresh Token Rotation**: Secure token refresh mechanism

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your_production_database_url"
JWT_ACCESS_SECRET="your_production_access_secret"
JWT_REFRESH_SECRET="your_production_refresh_secret"
COOKIE_SECRET="your_production_cookie_secret"
```

### Build and Start

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you have any questions or need help, please open an issue in the GitHub repository.
# node-express-prisma
