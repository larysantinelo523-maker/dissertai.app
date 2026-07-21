-- Adiciona novas colunas à tabela user_roles para armazenar as informações dos usuários
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS telefone text,
ADD COLUMN IF NOT EXISTS objetivo text,
ADD COLUMN IF NOT EXISTS maior_desafio text,
ADD COLUMN IF NOT EXISTS meta_nota text;
