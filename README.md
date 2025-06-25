# BillVision

A bill management system built with Node.js and Express following the MVC pattern.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── models/         # Database models
├── routes/         # Route definitions
├── public/         # Static files
├── utils/          # Utility functions
└── server.js       # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Users
- GET /api/users - Get all users
- GET /api/users/:id - Get a single user
- POST /api/users - Create a new user
- PUT /api/users/:id - Update a user
- DELETE /api/users/:id - Delete a user

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests 