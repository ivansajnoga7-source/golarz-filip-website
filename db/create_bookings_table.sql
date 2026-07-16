-- Run this in Supabase SQL editor to create the bookings table
create extension if not exists "uuid-ossp";

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  date date not null,
  time time,
  note text,
  created_at timestamptz default now()
);

-- Optional index for quick date-based queries
create index if not exists bookings_date_idx on public.bookings (date);
