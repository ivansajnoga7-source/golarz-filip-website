-- Run this in Supabase SQL Editor.
-- Goal: standardize barber selection storage in one canonical column.

alter table public.bookings
  add column if not exists barber_name text;

update public.bookings
set barber_name = coalesce(nullif(trim(barber_name), ''), nullif(trim(note), ''))
where barber_name is null or trim(barber_name) = '';
