-- Allow admins to delete reservations
CREATE POLICY "Admins can delete reservations" ON public.reservations
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));