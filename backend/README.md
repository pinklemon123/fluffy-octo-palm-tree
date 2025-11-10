# Backend (Supabase Configuration)

This folder contains the database schema and Supabase configuration for the forum application.

## Database Schema

- `users.sql`: User table with username, password, avatar, bio
- `messages.sql`: Messages table for forum discussions
- `follows.sql`: Follow relationships between users

## Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL files in your Supabase SQL editor to create tables
3. Create storage buckets: `avatars` and `uploads`
4. Update the Supabase URL and keys in the configuration files

## Configuration

- `supabase.js`: Server-side Supabase client
- `storage.js`: File storage utilities