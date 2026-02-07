create or replace function equip_item(item_id_input bigint)
returns jsonb
language plpgsql
security definer
as $$
declare
  target_item_type text;
  user_id_val uuid;
begin
  user_id_val := auth.uid();
  
  -- 1. Get the type of the item being equipped
  select type into target_item_type
  from items
  where id = item_id_input;

  if target_item_type is null then
    return jsonb_build_object('success', false, 'message', 'Item not found');
  end if;

  -- 2. Unequip all items of this type for this user
  -- (We join user_inventory with items to find which inventory rows match the type)
  update user_inventory
  set equipped = false
  where user_id = user_id_val
  and item_id in (
    select id from items where type = target_item_type
  );

  -- 3. Equip the specific item
  update user_inventory
  set equipped = true
  where user_id = user_id_val
  and item_id = item_id_input;

  return jsonb_build_object('success', true, 'message', 'Item equipped');
end;
$$;

create or replace function unequip_item(item_id_input bigint)
returns jsonb
language plpgsql
security definer
as $$
begin
  update user_inventory
  set equipped = false
  where user_id = auth.uid()
  and item_id = item_id_input;

  return jsonb_build_object('success', true, 'message', 'Item unequipped');
end;
$$;
