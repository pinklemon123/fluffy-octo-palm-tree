# Forum Project

A web forum application with user registration, file uploads, real-time chat, and user profiles.

## Features

- User registration and login with username/password (no email required)
- Avatar upload and personal bio
- File uploads (HTML, documents, images, PDFs, etc.)
- Real-time discussion forum
- User following system

## Tech Stack

- Frontend: React
- Backend API: Node.js + Express
- Database: Neon (PostgreSQL compatible)

## Setup

1. Clone or download this project
2. Provision a Neon project and run the SQL files in `backend/schema`
3. Configure backend environment variables (see `backend/README.md`)
4. Install dependencies: `cd frontend && npm install`
5. Start the frontend app: `npm start`

## Deployment to Vercel

1. Connect your GitHub repo to Vercel
2. In **Project → Settings → Environment Variables** configure:
   - Backend (Node/Express):
     - `DATABASE_URL`: The Neon connection string (the same one you use with `psql`)
     - `JWT_SECRET`: Random string used for signing tokens
     - (Optional) `CORS_ORIGIN`: Your deployed frontend origin, e.g. `https://your-app.vercel.app`
   - Frontend (React + Supabase features):
     - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
     - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Deploy the backend (as a Vercel Serverless/Node app) and frontend. Remember to expose the backend URL to the frontend if you call it directly.

## Project Structure

- `frontend/`: React application
- `backend/`: Express API and database schema