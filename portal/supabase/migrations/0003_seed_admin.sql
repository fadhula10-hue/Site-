-- =============================================================
-- Promotion d'un compte en admin
-- À EXÉCUTER APRÈS avoir créé le compte admin via l'UI Supabase Auth.
-- Remplacez l'email ci-dessous par votre adresse admin.
-- =============================================================

update public.profiles
   set role = 'admin'
 where email = 'contact@olympeproduction.com';
