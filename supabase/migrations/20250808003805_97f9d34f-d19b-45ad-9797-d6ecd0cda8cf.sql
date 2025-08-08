
-- 1) Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_admin());

-- 2) Allow admins to update any profile (e.g., roles, scoping)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
