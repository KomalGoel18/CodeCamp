# SolveOn

SolveOn is a modern, full-stack coding platform that allows users to solve programming problems, track their activity streaks, view their performance on a comprehensive dashboard, and compete on a global leaderboard. The platform supports secure code execution and maintains reliable metrics via a MongoDB backend.

## 🚀 Features

- **User Authentication**: Secure login and registration system using JWT and `bcryptjs`.
- **Problem Solving**: Interactive code editor workspace powered by Monaco Editor for writing and testing code.
- **Secure Code Execution**: Submit code to be evaluated against preset test cases.
- **Progress Tracking**: Track problems solved, acceptance rates, current/best streaks, and rank percentile directly retrieved from the backend.
- **Leaderboard**: Global ranking system based on total points and problem difficulty.
- **Dashboard Analytics**: Visual representation of weekly coding activity and personal statistics.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript, built using Vite
- **Styling**: Tailwind CSS for responsive and modern UI
- **Routing**: React Router v7
- **Code Editor**: `@monaco-editor/react`
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Security & Auth**: JSON Web Tokens (JWT) in HttpOnly cookies, CORS protection, bcrypt hashing
- **Mailing**: Nodemailer (available for future notifications/recovery)

## 📁 Project Structure

This project uses a standalone directory structure for both sub-projects:

- `/frontend/` - Contains the React Vite application.
- `/backend/` - Contains the Express API and Mongoose models.

## 🚦 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/KomalGoel18/SolveOn
cd SolveOn
```

### 2. Backend Configuration
Navigate to the `backend` directory and install the necessary dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory. You will need at least the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

Start the backend development server using nodemon:
```bash
npm run dev
```
The server should start on `http://localhost:5000`.

### 3. Frontend Configuration
Open a new terminal, navigate to the `frontend` directory, and install the dependencies:
```bash
cd frontend
npm install
```

If necessary, configure environments inside `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
The frontend should now be running on `http://localhost:5173`.
