-- Scheduled settlement job for ended auctions
-- Replace the placeholders before running:
--   <PROJECT-REF>
--   <SERVICE-ROLE-KEY>
--   <AUCTION-CRON-SECRET>

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Runs every minute and calls the Edge Function stripe-settle-auction
select cron.schedule(
  'stripe-settle-auctions-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
      url := 'https://<PROJECT-REF>.functions.supabase.co/stripe-settle-auction',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer <SERVICE-ROLE-KEY>',
        'apikey', '<SERVICE-ROLE-KEY>',
        'x-cron-secret', '<AUCTION-CRON-SECRET>'
      ),
      body := '{"trigger":"pg_cron"}'::jsonb
    );
  $$
);

-- To stop the job later:
-- select cron.unschedule('stripe-settle-auctions-every-minute');
