-- Run this in Supabase SQL Editor.
-- Goal: prevent double-booking for the same date and time.

-- 1) Check whether duplicates already exist.
-- If this query returns rows, remove/merge those duplicates first.
select date, time, count(*) as cnt
from public.bookings
where time is not null
group by date, time
having count(*) > 1
order by date, time;

-- 2) Add unique index so one slot can only be booked once.
create unique index if not exists bookings_unique_date_time_idx
  on public.bookings (date, time)
  where time is not null;
