# Palm Mind - Real-time Chat Application Backend

A full-featured real-time chat application backend built with Node.js, Express, MongoDB, Socket.IO, and JWT authentication.

## Features

### Backend Features

- ✅ User Authentication (Register/Login/Logout) with JWT
- ✅ JWT-based authorization middleware
- ✅ Real-time messaging with Socket.IO
- ✅ Online/Offline user status tracking
- ✅ Chat history stored in MongoDB
- ✅ User join/leave event notifications
- ✅ Message persistence with conversation grouping
- ✅ Dashboard statistics (total users, active users, message count)
- ✅ CRUD operations for users
- ✅ Secure password hashing with bcrypt

### Socket.IO Events

- **Client → Server:**

  - `sendMessage` - Send a message to another user

- **Server → Client:**
  - `onlineUsers` - List of currently online user IDs
  - `userJoined` - Notification when a user connects
  - `userLeft` - Notification when a user disconnects
  - `newMessage` - New message received
  - `messageSent` - Confirmation of sent message

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.IO
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   cd palm_mind_backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   CORS_ORIGIN=http://localhost:5173
   JWT_SECRET=your-secret-key-change-this-in-production
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Ensure MongoDB is running on your system.

5. **Run the application**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - Login user
- `POST /api/v1/user/logout` - Logout user (Protected)

### Users

- `GET /api/v1/user/all` - Get all users (Protected)
- `GET /api/v1/user/stats` - Get dashboard stats (Protected)

### Messages

- `POST /api/v1/message/send` - Send a message (Protected)
- `GET /api/v1/message/:userId` - Get messages with a specific user (Protected)
- `GET /api/v1/message/` - Get all conversations (Protected)

## Project Structure

```
palm_mind_backend/
├── src/
│   ├── controllers/
│   │   ├── user.controller.js      # User CRUD & auth logic
│   │   └── message.controller.js   # Message handling logic
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   └── error.middleware.js     # Error handling
│   ├── models/
│   │   ├── userModel.js            # User schema
│   │   ├── messageModel.js         # Message schema
│   │   └── conversationModel.js    # Conversation schema
│   ├── routes/
│   │   ├── user.routes.js          # User routes
│   │   └── message.routes.js       # Message routes
│   ├── utils/
│   │   ├── jwt.js                  # JWT utilities
│   │   ├── ApiError.js             # Error class
│   │   ├── ApiResponse.js          # Response formatter
│   │   └── asyncHandlers.js        # Async error wrapper
│   ├── db/
│   │   └── index.js                # Database connection
│   ├── app.js                      # Express app setup
│   ├── index.js                    # Server entry point with Socket.IO
│   └── constants.js                # App constants
├── .env.example                    # Environment variables template
├── package.json
└── README.md
```

## Database Models

### User Model

```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  isOnline: Boolean,
  socketId: String,
  timestamps: true
}
```

### Message Model

```javascript
{
  conversationId: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  message: String,
  timestamps: true
}
```

### Conversation Model

```javascript
{
  participants: [ObjectId] (ref: User),
  lastMessage: String,
  timestamps: true
}
```

## Socket.IO Authentication

Socket connections require JWT authentication:

```javascript
const socket = io(SOCKET_URL, {
  auth: {
    token: "your-jwt-token",
  },
});
```

## Development

- The server runs on port `3000` by default
- CORS is configured to allow requests from the frontend (`http://localhost:5173`)
- JWT tokens expire after 7 days by default
- Passwords are hashed using bcrypt with 10 salt rounds

## Security Features

- JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Protected routes with authentication middleware
- CORS configuration
- Socket.IO authentication middleware

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

Gaurav Bist
