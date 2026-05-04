alter table public.orders
  add column if not exists stripe_checkout_session_id text not null default '',
  add column if not exists stripe_payment_intent_id text not null default '',
  add column if not exists stripe_charge_id text not null default '',
  add column if not exists stripe_transfer_id text not null default '',
  add column if not exists transfer_group text not null default '',
  add column if not exists escrow_funded_at timestamptz,
  add column if not exists payout_released_at timestamptz;

alter table public.payment_transactions
  add column if not exists transaction_type text not null default 'charge',
  add column if not exists checkout_session_id text not null default '',
  add column if not exists payment_intent_id text not null default '',
  add column if not exists charge_id text not null default '',
  add column if not exists transfer_id text not null default '',
  add column if not exists transfer_group text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payment_transactions_transaction_type_check'
  ) then
    alter table public.payment_transactions
      add constraint payment_transactions_transaction_type_check
      check (transaction_type in ('charge', 'release', 'refund'));
  end if;
end $$;

create unique index if not exists payment_transactions_checkout_session_id_key
  on public.payment_transactions (checkout_session_id)
  where checkout_session_id <> '';

create index if not exists payment_transactions_payment_intent_id_idx
  on public.payment_transactions (payment_intent_id)
  where payment_intent_id <> '';

create index if not exists orders_transfer_group_idx
  on public.orders (transfer_group)
  where transfer_group <> '';
