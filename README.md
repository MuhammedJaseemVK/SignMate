# Project Setup Guide

This guide explains how to set up and run the frontend and backend of your project.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/) (if using locally)
- A package manager (`npm` or `yarn`)

---

## Backend Setup

### 1. Navigate to the Backend Folder
```sh
cd backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
- Copy `.env.example` and rename it to `.env`
- Fill in the required values:
  ```env
  MONGODB_URL=your_mongodb_connection_string
  PORT=your_preferred_port
  JWT_SECRET=your_secret_key
  ```

### 4. Start the Server
- **Development Mode (with Nodemon for auto-restart):**
  ```sh
  npm run dev
  ```
- **Production Mode:**
  ```sh
  npm start
  ```

---

## Frontend Setup

### 1. Navigate to the Frontend Folder
```sh
cd frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Start the Development Server
```sh
npm run dev
```

- The frontend should now be running at `http://localhost:5173/` (default Vite port).

### 4. Build for Production
```sh
npm run build
```

### 5. Preview the Production Build
```sh
npm run preview
```

---

## Running Both Backend & Frontend Together
If you want to run both simultaneously, you can open two terminals:
1. Start the backend: `npm run dev` inside the `backend` folder.
2. Start the frontend: `npm run dev` inside the `frontend` folder.

---

## Notes
- Ensure MongoDB is running if using a local database.
- Update `.env` with proper credentials.
- If using a different port for the backend, update frontend API calls accordingly.

Happy coding! 🚀
