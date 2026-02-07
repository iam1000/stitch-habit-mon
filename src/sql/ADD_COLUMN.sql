alter table profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());
