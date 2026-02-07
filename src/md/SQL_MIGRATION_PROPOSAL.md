# Proposal: Switching from Supabase Client SDK to Direct SQL (via RPC/Edge Functions)

## 1. Current Approach (Client SDK)
- **Method**: We use `supabase.from('table').select/insert/update`.
- **Pros**: Easy, fast, no backend code needed.
- **Cons**: Complex logic (like "if user new, insert defaults") lives in the Frontend (React). Less secure if logic gets hacked.

## 2. Proposed Approach (Direct SQL / RPC)
We move the logic into the **Database** using PostgreSQL **Functions (RPC)**. The React app just calls *one function* instead of managing tables directly.

### Example: "Initialize User Habits"

#### A. New SQL Function (Run in Supabase Editor)
```sql
-- Function to initialize habits for a new user
create or replace function initialize_user_habits(target_user_id uuid)
returns setof habits
language plpgsql
security definer -- Runs with admin privileges locally
as $$
declare
  exists_check int;
begin
  -- 1. Check if habits exist
  select count(*) into exists_check from habits where user_id = target_user_id;
  
  -- 2. If no habits, insert defaults
  if exists_check = 0 then
    insert into habits (user_id, title, xp_reward)
    values 
      (target_user_id, 'Drink 2L Water', 10),
      (target_user_id, '20 Squats', 20),
      (target_user_id, 'Read 10 Pages', 15),
      (target_user_id, 'No Sugar', 25);
  end if;

  -- 3. Return all habits for the user
  return query select * from habits where user_id = target_user_id order by id asc;
end;
$$;
```

#### B. React Code Change (Dashboard.jsx)
**Before:**
```javascript
// Frontend Logic
const { data } = await supabase.from('habits').select('*')...
if (data.length === 0) {
   await supabase.from('habits').insert(defaults)...
}
```

**After (Simpler):**
```javascript
// One line to rule them all
const { data, error } = await supabase.rpc('initialize_user_habits', { 
  target_user_id: user.id 
});
setHabits(data);
```

## 3. Benefits of Change
1.  **Cleaner Frontend**: React code becomes much smaller.
2.  **Faster**: Only 1 network request instead of 2-3 (Check -> Insert -> Select).
3.  **Atomic**: No chance of "half-created" data if the browser crashes.

## 4. Recommendation
If you prefer **Raw SQL control** and **Performance**, this is the way to go.
Shall I proceed with implementing this SQL function and updating the React code?
