# KG STORE - E-Commerce Web Application

A complete, functional, beginner-friendly E-Commerce Web Application built with HTML/CSS/Vanilla JS for the frontend and Python/FastAPI/SQLite for the backend.

## 1. Project Overview
This project is a modern, responsive, and functional e-commerce platform that allows users to browse products, manage their shopping carts, and place orders. Admins have a dedicated dashboard to manage products, view users, and update order statuses.

## 2. Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Fetch API
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite
- **Authentication**: JWT Token based (Passlib/Bcrypt)

## 3. Project Folder Structure
```
ecommerce-app/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── admin.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── products.js
│       ├── cart.js
│       ├── checkout.js
│       ├── orders.js
│       └── admin.js
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── requirements.txt
└── README.md
```

## 4. How to Install Python Dependencies
Ensure you have Python 3.8+ installed. Navigate to the `backend` folder and run:
```bash
pip install -r requirements.txt
```

## 5. How to Start the FastAPI Backend
Navigate to the `backend` folder and run the Uvicorn server:
```bash
uvicorn main:app --reload
```
The backend API will run at `http://127.0.0.1:8000`.

## 6. How to Open/Run the Frontend
The frontend consists of static HTML files. You can simply open `frontend/index.html` in your web browser. Or, you can use any live server extension (like VSCode Live Server) to serve the `frontend` folder.

## 7. Database Structure
- **Users**: id, name, email, password_hash, role, created_at
- **Products**: id, name, description, category, price, image_url, stock, created_at
- **Orders**: id, user_id, total_amount, delivery_address, phone, city, pincode, payment_method, status, created_at
- **OrderItems**: id, order_id, product_id, product_name, quantity, price

## 8. API Endpoint Descriptions
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user profile
- `GET /api/products` - List all available products (stock > 0)
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Admin: Create new product
- `PUT /api/products/{id}` - Admin: Update product
- `DELETE /api/products/{id}` - Admin: Delete product
- `POST /api/orders` - Place a new order
- `GET /api/orders` - Get current user's orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Admin: Update order status
- `GET /api/admin/orders` - Admin: Get all orders
- `GET /api/admin/users` - Admin: Get all users
- `GET /api/admin/statistics` - Admin: Get dashboard stats

## 9. Initial Admin Account
When the backend starts up, it automatically creates an initial admin account if one doesn't exist:
- **Email**: `admin@kgstore.com`
- **Password**: `admin123`

## 10. Authentication and Authorization
The API uses OAuth2 with Password (and bearer with JWT tokens) for authentication. When a user logs in, they receive a JWT access token. This token is stored in `localStorage` in the browser and passed as a `Bearer` token in the `Authorization` header of subsequent API requests. The backend validates the token, extracts the user details, and enforces Role-Based Access Control (RBAC). Specific endpoints (like creating products or viewing all users) require the `ADMIN` role.
