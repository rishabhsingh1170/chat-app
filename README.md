# ChatApp

A full-stack MERN chat application with authentication, email OTP signup, real-time messaging, typing indicators, online user presence, profile image uploads, and theme support.

## Tech Stack

- React 19, Vite, Tailwind CSS, DaisyUI
- Zustand for frontend state management
- Node.js, Express, MongoDB, Mongoose
- Socket.IO for real-time chat
- JWT authentication with HTTP cookies
- Cloudinary for image uploads
- Nodemailer for OTP email delivery

## Project Structure

```text
chatApp/
  backend/    Express API, Socket.IO server, MongoDB models
  frontend/   React/Vite client
```

## Prerequisites

- Node.js
- npm
- MongoDB database
- Cloudinary account
- SMTP email account or provider

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINAR_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINAR_API_KEY=your_cloudinary_api_key
CLOUDINAR_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_sender_email
```

Note: the Cloudinary variable names above match the current backend code.

## Installation

Install dependencies for both apps:

```bash
npm install --prefix backend
npm install --prefix frontend
```

## Run Locally

Start the backend:

```bash
npm run dev --prefix backend
```

Start the frontend in another terminal:

```bash
npm run dev --prefix frontend
```

Open the app at:

```text
http://localhost:5173
```

The frontend is configured to call the backend at `http://localhost:5000` in development, so keep `PORT=5000` in `backend/.env`.

## Available Scripts

From the root:

```bash
npm run build
npm start
```

Backend:

```bash
npm run dev --prefix backend
npm start --prefix backend
```

Frontend:

```bash
npm run dev --prefix frontend
npm run build --prefix frontend
npm run preview --prefix frontend
npm run lint --prefix frontend
```

## Features

- Signup with email OTP verification
- Login and logout with JWT cookies
- Protected routes
- Real-time one-to-one messaging
- Online users list
- Typing indicator
- Image messages and profile image uploads
- Account deletion
- Theme settings

## Production Build

Build the frontend and install dependencies:

```bash
npm run build
```

Start the backend server:

```bash
npm start
```

When `NODE_ENV=production`, the backend serves the built frontend from `frontend/dist`.
