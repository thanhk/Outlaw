# Outlaw - Job Management Platform

A full-stack job management platform that connects people who need tasks done with those who can help. Built with React, TypeScript, Node.js, and MongoDB.

## Features

### User Management
- User registration and authentication using JWT
- Profile management with rating system
- User dashboard showing created and assigned jobs

### Job Management
- Create, read, update, and delete jobs
- Job categories and filtering
- Location-based job tracking
- Reward and time estimation system

### Job Workflow
- Job assignment system
- Job completion requests and approvals
- Rating system for completed jobs
- Real-time status updates

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Redux for state management
- React Router for navigation
- Axios for API calls

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- RESTful API design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/thanhk/Outlaw.git
cd Outlaw
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Create .env files:

Backend (.env):
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Development Workflow

1. Create a new branch for each feature/fix
```bash
git checkout -b feature/feature-name
```

2. Make your changes and commit them
```bash
git add .
git commit -m "Description of changes"
```

3. Push changes to GitHub
```bash
git push origin feature/feature-name
```

4. Create a Pull Request on GitHub

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Job Endpoints
- GET /api/jobs - Get all jobs
- POST /api/jobs - Create a new job
- GET /api/jobs/:id - Get specific job
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job
- PUT /api/jobs/:id/apply - Apply for a job
- POST /api/jobs/:id/complete - Submit job completion
- POST /api/jobs/:id/approve - Approve job completion

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License. 