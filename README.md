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
- Backend: Supabase (Database, Auth, Storage, Realtime)

## Setup

1. Clone or download this project
2. Set up Supabase project
3. Run SQL schemas in Supabase
4. Update Supabase credentials in `frontend/src/services/supabase.js`
5. Install dependencies: `cd frontend && npm install`
6. Start the app: `npm start`

## Project Structure

- `frontend/`: React application
- `backend/`: Supabase schema and config