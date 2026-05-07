do $$
begin
  alter type public."OrderStatus" add value if not exists 'on_hold';
exception
  when undefined_object then
    null;
end
$$;
