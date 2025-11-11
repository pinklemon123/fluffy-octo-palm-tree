create extension if not exists "uuid-ossp";

create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  avatar_url text default '',
  bio text default '',
  created_at timestamptz default now()
);

create table if not exists files (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  filename text not null,
  mime text not null,
  url text default '',
  created_at timestamptz default now()
);

create table if not exists posts (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  content text not null,
  file_id bigint references files(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists follows (
  follower_id bigint not null references users(id) on delete cascade,
  following_id bigint not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_files_user on files(user_id, created_at desc);
create index if not exists idx_follows_follower on follows(follower_id);
