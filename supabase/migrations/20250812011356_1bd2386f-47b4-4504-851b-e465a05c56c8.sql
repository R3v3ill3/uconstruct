
-- Employers: allow delegates to manage
DROP POLICY IF EXISTS "Admins, organisers and leads can manage employers"
  ON public.employers;

CREATE POLICY "Admins, organisers and leads can manage employers"
  ON public.employers
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  )
  WITH CHECK (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );

-- Employer role tags: allow delegates to manage
DROP POLICY IF EXISTS "Admins, organisers and leads can manage employer role tags"
  ON public.employer_role_tags;

CREATE POLICY "Admins, organisers and leads can manage employer role tags"
  ON public.employer_role_tags
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  )
  WITH CHECK (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );

-- Contractor trade capabilities: note the existing policy name is truncated to 63 chars
DROP POLICY IF EXISTS "Admins, organisers and leads can manage contractor trade capabi"
  ON public.contractor_trade_capabilities;

CREATE POLICY "Admins, organisers and leads can manage contractor trade capabi"
  ON public.contractor_trade_capabilities
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  )
  WITH CHECK (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );
