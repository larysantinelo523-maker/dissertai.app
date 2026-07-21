ALTER TABLE public.redacoes ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id);
