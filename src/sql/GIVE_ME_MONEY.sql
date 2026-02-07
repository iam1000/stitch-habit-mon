-- Give 5000 coins to specific user
update profiles 
set coins = 5000 
where id = auth.uid();

-- If executing from SQL Editor and auth.uid() is not available,
-- you can target by email (requires extension) or just update ALL users for dev
update profiles set coins = 5000;
