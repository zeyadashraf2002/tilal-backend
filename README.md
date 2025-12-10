# 🌿 Garden Management System - Backend API

Complete backend API for managing garden maintenance and landscaping services.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env
```

4. **Seed database with test data:**
```bash
npm run seed
```

5. **Start development server:**
```bash
npm run dev
```

The API will be available at: `http://localhost:5000`

## 🔑 Test Credentials

After running `npm run seed`, use these credentials:

**Admin:**
- Email: `admin@garden.com`
- Password: `admin123`

**Worker:**
- Email: `worker@garden.com`
- Password: `worker123`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (admin/worker)
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `PUT /api/v1/auth/update-password` - Update password

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get single user (Admin only)
- `POST /api/v1/users` - Create user (Admin only)
- `PUT /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)
- `GET /api/v1/users/workers` - Get all workers

### Tasks
- `GET /api/v1/tasks` - Get all tasks
- `GET /api/v1/tasks/:id` - Get single task
- `POST /api/v1/tasks` - Create task (Admin only)
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task (Admin only)
- `POST /api/v1/tasks/:id/start` - Start task (Worker)
- `POST /api/v1/tasks/:id/complete` - Complete task (Worker)

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   └── taskController.js    # Task management
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── validator.js         # Input validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Client.js            # Client model
│   │   ├── Branch.js            # Branch model
│   │   ├── Task.js              # Task model
│   │   ├── Inventory.js         # Inventory model
│   │   ├── Invoice.js           # Invoice model
│   │   ├── Notification.js      # Notification model
│   │   └── Settings.js          # Settings model
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── userRoutes.js        # User routes
│   │   └── taskRoutes.js        # Task routes
│   ├── services/
│   │   ├── pdfService.js        # PDF generation
│   │   ├── emailService.js      # Email notifications
│   │   └── whatsappService.js   # WhatsApp notifications
│   └── utils/
│       ├── jwt.js               # JWT utilities
│       └── seed.js              # Database seeding
├── uploads/
│   ├── images/                  # Task images
│   └── invoices/                # Generated invoices
├── tests/                       # Test files
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── server.js                    # Entry point
└── README.md                    # This file
```

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ MongoDB injection prevention
- ✅ XSS protection
- ✅ Input validation & sanitization

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with test data
- `npm test` - Run tests

## 🌐 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔗 Integration with Frontend

The backend is configured to work with the React frontend on `http://localhost:5173`.

To connect:
1. Make sure backend is running on port 5000
2. Frontend will automatically connect via `VITE_API_BASE_URL`
3. Use the same test credentials for login

## 📚 Database Models

### User
- Admin and Worker accounts
- JWT authentication
- Role-based permissions

### Client
- Customer information
- Property details
- Contact information

### Task
- Task management
- Status tracking
- GPS coordinates
- Before/after images
- Material tracking

### Inventory
- Stock management
- Low stock alerts
- Branch-specific inventory

### Invoice
- Auto-generated invoices
- PDF generation
- Payment tracking

## 🚀 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set secure `JWT_SECRET`
4. Run `npm start`

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

ISC License - Garden Management System

