create table if not exists users (
  id serial primary key,
  username text unique not null,
  password text not null,  -- Note: In production, store hashed passwords
  avatar_url text,
  bio text
);