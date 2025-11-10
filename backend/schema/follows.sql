create table if not exists follows (
  follower_id integer references users(id),
  following_id integer references users(id),
  primary key (follower_id, following_id)
);