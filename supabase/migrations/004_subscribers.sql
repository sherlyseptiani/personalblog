create table if not exists subscribers (
  id         uuid        primary key default gen_random_uuid(),
  contact    text        not null,
  type       text        not null check (type in ('email', 'phone')),
  ip_hash    text,
  created_at timestamptz default now()
);

-- Case-insensitive unique index prevents duplicate signups
create unique index if not exists subscribers_contact_idx on subscribers (lower(contact));

alter table subscribers enable row level security;

create policy "anon_can_insert"
  on subscribers for insert to anon
  with check (true);
