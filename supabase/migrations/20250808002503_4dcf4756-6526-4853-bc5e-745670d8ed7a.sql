
-- 1) Remove duplicate pending_users rows by email, keeping the most recent
WITH ranked AS (
  SELECT
    id,
    email,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, id DESC) AS rn
  FROM public.pending_users
)
DELETE FROM public.pending_users p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;

-- 2) Add unique constraint so upsert ... on conflict (email) works
ALTER TABLE public.pending_users
ADD CONSTRAINT pending_users_email_unique UNIQUE (email);
