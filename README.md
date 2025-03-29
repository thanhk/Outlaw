# Outlaw - Errand & Odd Jobs Platform

Outlaw is a platform that connects people who need help with errands or odd jobs to people who can help them. Similar to Uber, but for various tasks and errands instead of rides.

## Features

- User authentication (sign up, login, profile management)
- Job posting with rewards
- Job browsing and search
- Job acceptance and completion tracking
- Rating and review system
- Real-time notifications
- Payment integration

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Real-time updates: Socket.io
- Payment processing: Stripe

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Copy the example environment variables and fill in your values

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
outlaw/
├── frontend/           # React frontend application
├── backend/           # Node.js backend application
└── README.md          # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 