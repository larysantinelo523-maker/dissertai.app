-- Criação da tabela de Perfis
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

-- Permite leitura de todos (para o frontend saber quem é admin)
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO authenticated;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
