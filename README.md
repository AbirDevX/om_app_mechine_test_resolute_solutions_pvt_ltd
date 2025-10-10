Here's a comprehensive README file for your **Transactional Order Management API** project :[1][2][3]

# **Transactional Order Management API**

A robust Node.js/Express.js API for order management with atomic transaction handling, built with **Sequelize ORM** and **MySQL**. This API demonstrates advanced database transaction patterns, JWT authentication, and comprehensive validation using Joi.

## **📋 Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Key Implementation Details](#key-implementation-details)
- [Postman Collection](#postman-collection)
- [Contributing](#contributing)
- [License](#license)

## **🎯 Features**

- ✅ **Atomic Transaction Management** - All order operations use database transactions with automatic rollback
- ✅ **Stock Management** - Real-time stock validation and decrement during order creation
- ✅ **JWT Authentication** - Secure user registration, login, and protected routes
- ✅ **Comprehensive Validation** - Request/response validation using Joi schemas
- ✅ **Error Handling** - Production-grade error handling with Winston logging
- ✅ **CRUD Operations** - Complete product and order management
- ✅ **Pagination & Search** - Advanced filtering and search capabilities
- ✅ **Soft Deletion** - Logical deletion for data integrity
- ✅ **Database Relationships** - Proper foreign keys and associations

## **🛠 Tech Stack**

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.0+
- **ORM**: Sequelize 6.x
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi 17.x
- **Logging**: Winston 3.x
- **Password Hashing**: bcrypt
- **Environment**: dotenv
- **Development**: Nodemon

## **📋 Prerequisites**

Before running this project, ensure you have:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **MySQL** (version 8.0 or higher)
- **Git**

## **🚀 Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/transactional-order-api.git
   cd transactional-order-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install development dependencies**
   ```bash
   npm install --save-dev nodemon
   ```

## **🗄 Database Setup**

1. **Create MySQL database**
   ```sql
   CREATE DATABASE omapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Run migrations**
   ```bash
   npx sequelize-cli db:migrate
   ```

3. **Seed test data** (optional)
   ```bash
   npx sequelize-cli db:seed:all
   ```

## **⚙️ Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development
ENABLE_CONSOLE_LOGS=true

# Database Configuration
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=omapp
DB_CLIENT=mysql
DB_HOST=localhost

# JWT Secrets
JWT_ACCESS_TOKEN_SECRET=your_super_secure_access_token_secret_here_min_32_chars
JWT_REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_here_min_32_chars

# URLs
CLIENT_SERVER_URL=http://localhost:3000
SERVER_URL=http://localhost:8080

# Logging
LOG_LEVEL=info
SERVICE_NAME=order-management-api
APP_VERSION=1.0.0
```

## **▶️ Running the Application**

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Database Operations
```bash
# Reset database (migration + seeds)
npm run db:reset

# Run only seeds
npm run db:seed

# Undo seeds
npm run db:seed:undo
```

## **📊 API Endpoints**

### **Authentication**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | User registration | ❌ |
| POST | `/api/v1/auth/login` | User login | ❌ |

### **Products**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/product/add` | Create product | ❌ |
| GET | `/api/v1/product/list` | List products (paginated) | ❌ |

### **Orders**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/order/create` | Create order (atomic) | ✔ |
| GET | `/api/v1/order/list` | List orders with products | ✔ |

### **Health Check**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health status | ❌ |

## **🗂 Database Schema**

### **Users Table**
```sql
- id (Primary Key)
- full_name
- username (Unique)
- email (Unique) 
- mobile (Unique)
- password (Hashed)
- status
- is_deleted
- created_at, updated_at
```

### **Products Table**
```sql
- id (Primary Key)
- name
- price (DECIMAL 10,2)
- stock (INTEGER)
- description
- status
- is_deleted
- created_at, updated_at
```

### **Orders Table**
```sql
- id (Primary Key)
- user_name
- user_id (Foreign Key - optional)
- total_amount (DECIMAL 10,2)
- order_status (ENUM)
- payment_status (ENUM)
- notes
- is_deleted
- created_at, updated_at
```

### **Order Items Table** (Junction)
```sql
- id (Primary Key)
- order_id (Foreign Key)
- product_id (Foreign Key)
- qty
- unit_price (DECIMAL 10,2)
- total_price (DECIMAL 10,2)
- created_at, updated_at
```

## **🧪 Testing**

### **Sample API Calls**

#### **1. Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "Password@123"
}
```

#### **2. Create Product**
```bash
POST /api/products
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "price": 129999.00,
  "stock": 50,
  "description": "Latest iPhone 15 Pro with 256GB storage"
}
```

#### **3. Create Order (Atomic Transaction)**
```bash
POST /api/orders
Content-Type: application/json

{
  "userName": "John Doe",
  "products": [
    {
      "productId": 1,
      "qty": 2
    },
    {
      "productId": 2,
      "qty": 1
    }
  ],
  "notes": "Express delivery requested"
}
```

## **📁 Project Structure**

```
transactional-order-api/
├── config/
│   └── database.js              # Database configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── orderController.js       # Order management
│   └── productController.js     # Product management
├── middlewares/
│   ├── authMiddleware.js        # JWT authentication
│   └── validation.js            # Request validation
├── migrations/                  # Database migrations
│   ├── create-users.js
│   ├── create-products.js
│   ├── create-orders.js
│   └── create-order-items.js
├── models/
│   ├── user.js                  # User model
│   ├── product.js               # Product model
│   ├── order.js                 # Order model
│   └── orderItem.js             # Order items model
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── orderRoutes.js           # Order endpoints
│   └── productRoutes.js         # Product endpoints
├── seeders/                     # Test data
│   ├── demo-users.js
│   ├── demo-products.js
│   ├── demo-orders.js
│   └── demo-order-items.js
├── services/
│   ├── hashService.js           # Password hashing
│   └── jwtService.js            # JWT operations
├── utility/
│   ├── exception/
│   │   └── httpException.js     # Custom exceptions
│   └── logger/
│       └── logger.utility.js    # Winston logging
├── validators/
│   ├── authValidators.js        # Auth validation schemas
│   ├── orderValidators.js       # Order validation schemas
│   └── productValidators.js     # Product validation schemas
├── logs/                        # Application logs
├── .env                         # Environment variables
├── .sequelizerc                 # Sequelize configuration
├── index.js                     # Application entry point
└── package.json
```

## **🔧 Key Implementation Details**

### **Atomic Transactions**
All order creation operations use Sequelize managed transactions:
```javascript
const transaction = await sequelize.transaction();
try {
  // 1. Validate stock availability
  // 2. Create order
  // 3. Create order items  
  // 4. Decrement product stock
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### **Stock Management**
- Stock validation before order creation
- Atomic stock decrement using `Product.decrement()`
- Rollback on insufficient stock

### **Security Features**
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens (24h access, 30d refresh)
- Input sanitization (HTML/XSS prevention)
- SQL injection prevention via Sequelize ORM

### **Error Handling**
- Global error handlers for uncaught exceptions
- Winston logging with file rotation
- Structured error responses
- Environment-specific error details

## **📮 Postman Collection**

Import the provided `Order_Management_API.postman_collection.json` file into Postman to test all endpoints with:
- Pre-configured requests
- Environment variables
- Authentication tokens
- Sample test data
- Error scenario testing

## **🔍 Performance Considerations**

- Database indexes on frequently queried columns
- Pagination for large datasets
- Connection pooling for database
- Efficient Sequelize queries with `attributes` selection
- Logging with appropriate levels

## **🚦 Environment-Specific Behavior**

### Development
- Detailed error messages with stack traces
- Console logging enabled
- Database query logging
- Auto-restart with nodemon

### Production
- Minimal error exposure
- File-based logging only
- Error tracking and monitoring
- PM2 process management (optional)

## **📚 API Response Format**

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "status_code": 200,
  "data": { /* response data */ },
  "pagination": { /* pagination info */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "status_code": 400,
  "error": "error_code",
  "errors": [ /* validation errors */ ]
}
```

## **🤝 Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## **📄 License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **👨‍💻 Author**

**Abir Santra**
- GitHub: [@AbirDevX](https://github.com/AbirDevX)
- LinkedIn: [abir-santra](https://www.linkedin.com/in/abir-santra/)
- Email: abir.devx@gmail.com

## **🙏 Acknowledgments**

- Assessment requirements provided by the hiring team
- Express.js and Sequelize documentation
- Node.js community best practices
- JWT and bcrypt security standards

***

**Made with ❤️ for the technical assessment**

**⚡ Quick Start**: `npm install && npm run db:reset && npm run dev`