Perfect! Now I can create a comprehensive README.md based on your **Task-2** requirements and actual Postman collection endpoints. Here's the updated final README file:

# **🛒 E-Commerce Order Management API (OMAPP)**

A comprehensive Node.js/Express.js REST API for e-commerce order management with **atomic transaction handling**, built with **MongoDB** and **Mongoose**. Features complete cart management, order processing, payment simulation, inventory reservation system, and admin dashboard capabilities.

## **📋 Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [System Workflow](#system-workflow)
- [Database Schema](#database-schema)
- [Testing with Postman](#testing-with-postman)
- [Project Structure](#project-structure)
- [Key Implementation Details](#key-implementation-details)

## **🎯 Features**

- ✅ **Atomic Transaction Management** - MongoDB transactions with automatic rollback
- ✅ **Stock Reservation System** - Real-time inventory locking during checkout
- ✅ **Multi-Role Authentication** - JWT-based auth for Users and Admins
- ✅ **Order State Management** - Complete lifecycle from PENDING_PAYMENT to DELIVERED
- ✅ **Shopping Cart System** - Add, update, remove items with stock validation
- ✅ **Payment Processing** - Mock payment simulation with 15-minute expiry
- ✅ **Admin Dashboard** - Order management, status updates, and analytics
- ✅ **Advanced Pagination & Filtering** - For products and orders
- ✅ **Production-Grade Validation** - Joi schema validation
- ✅ **Centralized Error Handling** - Consistent error responses
- ✅ **API Documentation** - Swagger/OpenAPI integration

## **🛠 Tech Stack**

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.1
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi 18.0.1
- **Password Security**: bcrypt 6.0.0
- **Environment Management**: @dotenvx/dotenvx
- **API Documentation**: Swagger UI
- **Development**: Nodemon, Morgan logging

## **📋 Prerequisites**

- **Node.js** (version 18.0+)
- **MongoDB** (version 5.0+ with replica set for transactions)
- **npm** (version 8.0+)
- **Postman** (for testing)

## **🚀 Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/omapp.git
   cd omapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## **⚙️ Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ecommerce_app

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_super_secure_access_token_secret_min_32_chars
JWT_REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_min_32_chars

# Application Settings
CLIENT_SERVER_URL=http://localhost:3000
SERVER_URL=http://localhost:8080
ENABLE_CONSOLE_LOGS=true
LOG_LEVEL=info
SERVICE_NAME=omapp
APP_VERSION=1.0.0
```

## **🗄 Database Setup**

### **MongoDB Replica Set Setup (Required for Transactions)**

```bash
# Start MongoDB with replica set
mongod --replSet rs0 --port 27017

# Initialize replica set in mongo shell
mongo --port 27017
> rs.initiate()
```

### **Seed Database**
```bash
# Seed all data (users + products)
npm run seed:all

# Fresh database setup
npm run db:fresh
```

## **▶️ Running the Application**

```bash
# Development mode
npm run dev

# Production mode
npm start

# Database operations
npm run seed:all        # Seed everything
npm run db:reset        # Reset database
npm run seed:clear      # Clear all data
```

Access the application:
- **API Base URL**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/health`
- **API Documentation**: `http://localhost:8080/api-docs`

## **📊 API Endpoints**

Based on your Postman collection, here are the **Task-2** endpoints:

### **🔑 Authentication**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/auth/register` | User registration |
| POST | `/api/v1/user/auth/login` | User login |
| POST | `/api/v1/admin/auth/login` | Admin login |

### **🛍 Product Management (Admin)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/product-manage/add` | Add new product |
| PUT | `/api/v1/admin/product-manage/update/:id` | Update product |
| DELETE | `/api/v1/admin/product-manage/delete/:id` | Delete product |
| GET | `/api/v1/admin/product-manage/detail/:id` | Get single product |
| GET | `/api/v1/admin/product-manage/products` | List products (admin) |

### **📦 Product Browsing (User/Public)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/product/list` | List products with filters |
| GET | `/api/v1/user/product/product/:id` | Get product details |

### **🛒 Shopping Cart (User)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/cart/cart` | View cart contents |
| POST | `/api/v1/user/cart/add-to-cart` | Add item to cart |
| PUT | `/api/v1/user/cart/items/:productId` | Update item quantity |
| DELETE | `/api/v1/user/cart/items/:productId` | Remove cart item |
| DELETE | `/api/v1/user/cart/clear` | Clear entire cart |

### **📋 Order Management (User)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/order/checkout` | Create order from cart |
| POST | `/api/v1/user/order/:id/pay` | Process payment |
| GET | `/api/v1/user/order/list` | User's order history |
| GET | `/api/v1/user/order/single/:id` | Get single order |

### **👑 Admin Order Management**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/order-manage/list` | List all orders |
| GET | `/api/v1/admin/order-manage/details/:id` | Order details |
| PATCH | `/api/v1/admin/order-manage/update/:id/status` | Update order status |

## **🔄 System Workflow**

### **Complete E-Commerce Flow**

1. **User Registration & Authentication**
   - User registers → receives JWT token
   - Admin logs in with admin credentials

2. **Product Management**
   - Admin adds products with stock information
   - Users browse products with pagination/filtering

3. **Shopping Cart Operations**
   - User adds products to cart
   - Real-time stock validation
   - Cart persistence across sessions

4. **Order Creation & Stock Reservation**
   - User initiates checkout
   - **Atomic transaction** reserves stock
   - Order created with `PENDING_PAYMENT` status
   - 15-minute payment window starts

5. **Payment Processing**
   - Mock payment endpoint simulates transaction
   - Success: Order → `PAID`, stock finalized
   - Failure: Order → `CANCELLED`, stock released

6. **Order Fulfillment**
   - Admin updates status: `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED`
   - Order lifecycle tracking

## **🗂 Database Schema**

### **Users Collection**
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  mobile: String (unique),
  password: String (hashed),
  role: String ['USER', 'ADMIN'],
  status: Number (0: inactive, 1: active),
  isDeleted: Number (0: active, 1: deleted)
}
```

### **Products Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  price: Decimal128,
  totalStock: Number,
  reservedStock: Number, // For reservation system
  description: String,
  status: Number (0: inactive, 1: active),
  isDeleted: Number
}
```

### **Carts Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', unique),
  status: Number (0: abandoned, 1: active, 2: converted)
}
```

### **Cart Items Collection**
```javascript
{
  _id: ObjectId,
  cartId: ObjectId (ref: 'Cart'),
  productId: ObjectId (ref: 'Product'),
  quantity: Number,
  unitPrice: Decimal128,
  totalPrice: Decimal128
}
```

### **Orders Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  totalAmount: Decimal128,
  orderStatus: String ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  notes: String,
  isDeleted: Number
}
```

### **Order Items Collection**
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: 'Order'),
  productId: ObjectId (ref: 'Product'),
  quantity: Number,
  priceAtPurchase: Decimal128 // Price locked at purchase time
}
```

### **Payments Collection**
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: 'Order'),
  transactionId: String (unique),
  amount: Decimal128,
  status: Number (0: pending, 1: success, 2: failed),
  paymentMethod: String,
  paidAt: Date,
  expiresAt: Date // 15-minute expiry
}
```

## **🧪 Testing with Postman**

### **Import the Collection**
1. Import the provided `OM-APP.postman_collection.json`
2. Set environment variables:
   ```
   BASE_URL = http://localhost:8080
   ACCESS_TOKEN = (auto-populated after login)
   ADMIN_TOKEN = (auto-populated after admin login)
   ```

### **Complete Test Workflow**

#### **1. Admin Setup**
```bash
POST /api/v1/admin/auth/login
{
  "email": "admin@ecommerce.com",
  "password": "admin123"
}
```

#### **2. Add Products (Admin)**
```bash
POST /api/v1/admin/product-manage/add
Authorization: Bearer {{ADMIN_TOKEN}}
{
  "name": "iPhone 15 Pro",
  "price": 129999.99,
  "totalStock": 50,
  "description": "Latest iPhone with advanced features"
}
```

#### **3. User Registration**
```bash
POST /api/v1/user/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "12345678"
}
```

#### **4. User Login**
```bash
POST /api/v1/user/auth/login
{
  "identifier": "john@example.com",
  "password": "12345678"
}
```

#### **5. Add to Cart**
```bash
POST /api/v1/user/cart/add-to-cart
Authorization: Bearer {{ACCESS_TOKEN}}
{
  "productId": "68f3883cb0d05d8b6fc4ae3b",
  "quantity": 2
}
```

#### **6. Checkout Order**
```bash
POST /api/v1/user/order/checkout
Authorization: Bearer {{ACCESS_TOKEN}}
{
  "notes": "Express delivery preferred"
}
```

#### **7. Process Payment**
```bash
POST /api/v1/user/order/{orderId}/pay
Authorization: Bearer {{ACCESS_TOKEN}}
{
  "paymentMethod": "mock"
}
```

#### **8. Admin Order Management**
```bash
GET /api/v1/admin/order-manage/list?status=PAID&page=1&limit=10
Authorization: Bearer {{ADMIN_TOKEN}}

PATCH /api/v1/admin/order-manage/update/{orderId}/status
Authorization: Bearer {{ADMIN_TOKEN}}
{
  "status": "SHIPPED",
  "notes": "Order dispatched via FedEx"
}
```

## **📁 Project Structure**

```
omapp/
├── src/
│   ├── config/
│   │   └── mongo.config.js
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── adminAuthController.js
│   │   │   ├── adminProductController.js
│   │   │   └── adminOrderController.js
│   │   └── user/
│   │       ├── userAuthController.js
│   │       ├── userProductController.js
│   │       ├── userCartController.js
│   │       └── userOrderController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js & CartItem.js
│   │   ├── Order.js & OrderItem.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── admin/
│   │   └── user/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validation.js
│   ├── validators/
│   ├── seeders/
│   └── swagger/
├── .env
├── package.json
├── index.js
└── README.md
```

## **🔧 Key Implementation Details**

### **Atomic Transactions**
```javascript
const session = await mongoose.startSession();
try {
  await session.startTransaction();
  
  // 1. Reserve stock
  await Product.updateMany(
    { _id: { $in: productIds } },
    { $inc: { reservedStock: quantities } },
    { session }
  );
  
  // 2. Create order
  const order = await Order.create([orderData], { session });
  
  // 3. Create payment record
  await Payment.create([paymentData], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### **Stock Reservation System**
- **Available Stock** = `totalStock - reservedStock`
- **During Checkout**: Stock moves to `reservedStock`
- **Payment Success**: `reservedStock` decremented, `totalStock` reduced
- **Payment Failure**: `reservedStock` released back

### **Order State Machine**
```
PENDING_PAYMENT → PAID → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
       ↓
   CANCELLED
```

### **JWT Authentication**
- **Access Token**: 24 hours validity
- **Role-based Access**: User vs Admin permissions
- **Route Protection**: Middleware validates tokens

## **🌟 Advanced Features**

### **Pagination & Filtering**
```bash
GET /api/v1/user/product/list?page=1&limit=10&minPrice=10000&maxPrice=50000&sortBy=price&sortOrder=asc
```

### **Admin Analytics**
```bash
GET /api/v1/admin/order-manage/list?status=PAID&startDate=2024-01-01&endDate=2024-12-31
```

### **Error Handling**
```javascript
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10",
  "status_code": 400,
  "error": "STOCK_INSUFFICIENT"
}
```

## **🚀 Production Considerations**

- **Database Indexes** on frequently queried fields
- **Connection Pooling** for MongoDB connections
- **Rate Limiting** for API endpoints
- **Request Validation** using Joi schemas
- **Error Logging** with Winston/Morgan
- **Environment Configuration** with dotenv
- **API Documentation** with Swagger

## **📝 Testing Coverage**

The Postman collection includes:
- ✅ Authentication flows (User & Admin)
- ✅ Product CRUD operations
- ✅ Complete cart management
- ✅ End-to-end order workflow
- ✅ Admin order management
- ✅ Error scenario testing
- ✅ Edge cases and validations

## **🤝 Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## **📄 License**

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

***

**Built with ❤️ for scalable e-commerce solutions**

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/71118768/106c23aa-77cf-4ae9-917c-3393ad6b8eb2/OM-APP.postman_collection.json)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/71118768/725fb89b-2776-471f-9f62-4bfed9a415c0/Node-JS-Task-2.docx)