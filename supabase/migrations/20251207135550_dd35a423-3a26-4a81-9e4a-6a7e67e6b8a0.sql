-- Limpiar todos los datos de las tablas
TRUNCATE TABLE public.reservations CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Eliminar los triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Recrear el trigger para crear perfiles automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear trigger para asignar rol de usuario automáticamente
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Crear perfiles para usuarios existentes que no tengan perfil
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data ->> 'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Crear roles para usuarios existentes que no tengan rol
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;