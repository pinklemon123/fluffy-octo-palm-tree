create table if not exists messages (
  id serial primary key,
  user_id integer references users(id),
  content text not null,
  created_at timestamp default now()
);