-- Allow admins to view all reservations
CREATE POLICY "Admins can view all reservations" ON public.reservations
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all reservations
CREATE POLICY "Admins can update all reservations" ON public.reservations
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));