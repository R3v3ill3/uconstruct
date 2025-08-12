
-- EMPLOYERS: replace single RESTRICTIVE FOR ALL policy with scoped policies

DROP POLICY IF EXISTS "Admins, organisers and leads can manage employers"
  ON public.employers;

-- Restrict UPDATE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can update employers"
  ON public.employers
  AS RESTRICTIVE
  FOR UPDATE
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

-- Restrict DELETE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can delete employers"
  ON public.employers
  AS RESTRICTIVE
  FOR DELETE
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );

-- Allow any authenticated user to INSERT (so viewers can create employers)
CREATE POLICY "Authenticated users can create employers"
  ON public.employers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- EMPLOYER ROLE TAGS: split policies similarly

DROP POLICY IF EXISTS "Admins, organisers and leads can manage employer role tags"
  ON public.employer_role_tags;

-- Restrict UPDATE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can update employer role tags"
  ON public.employer_role_tags
  AS RESTRICTIVE
  FOR UPDATE
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

-- Restrict DELETE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can delete employer role tags"
  ON public.employer_role_tags
  AS RESTRICTIVE
  FOR DELETE
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );

-- Allow any authenticated user to INSERT tags
CREATE POLICY "Authenticated users can create employer role tags"
  ON public.employer_role_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CONTRACTOR TRADE CAPABILITIES: split policies similarly

DROP POLICY IF EXISTS "Admins, organisers and leads can manage contractor trade capabi"
  ON public.contractor_trade_capabilities;

-- Restrict UPDATE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can update contractor trade caps"
  ON public.contractor_trade_capabilities
  AS RESTRICTIVE
  FOR UPDATE
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

-- Restrict DELETE to admin/organiser/lead/delegate
CREATE POLICY "Admins, organisers, leads and delegates can delete contractor trade caps"
  ON public.contractor_trade_capabilities
  AS RESTRICTIVE
  FOR DELETE
  TO public
  USING (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  );

-- Allow any authenticated user to INSERT trade capabilities
CREATE POLICY "Authenticated users can create contractor trade caps"
  ON public.contractor_trade_capabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
