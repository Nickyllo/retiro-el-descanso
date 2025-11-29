-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Recreate policies with TO authenticated to block anonymous access
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Drop existing policies on reservations
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;

-- Recreate policies with TO authenticated
CREATE POLICY "Admins can view all reservations" ON public.reservations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all reservations" ON public.reservations
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reservations" ON public.reservations
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own reservations" ON public.reservations
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON public.reservations
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Recreate policies with TO authenticated
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);