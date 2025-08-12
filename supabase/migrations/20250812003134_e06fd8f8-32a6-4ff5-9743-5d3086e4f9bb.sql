
-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_role_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_trade_capabilities ENABLE ROW LEVEL SECURITY;

-- Replace the restrictive "manage" policy on employers to include lead_organiser
DROP POLICY IF EXISTS "Admins and organisers can manage employers" ON public.employers;

CREATE POLICY "Admins, organisers and leads can manage employers"
ON public.employers
AS RESTRICTIVE
FOR ALL
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
);

-- Replace the restrictive "manage" policy on employer_role_tags to include lead_organiser
DROP POLICY IF EXISTS "Admins and organisers can manage employer role tags" ON public.employer_role_tags;

CREATE POLICY "Admins, organisers and leads can manage employer role tags"
ON public.employer_role_tags
AS RESTRICTIVE
FOR ALL
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
);

-- Replace the restrictive "manage" policy on contractor_trade_capabilities to include lead_organiser
DROP POLICY IF EXISTS "Admins and organisers can manage contractor trade capabilities" ON public.contractor_trade_capabilities;

CREATE POLICY "Admins, organisers and leads can manage contractor trade capabilities"
ON public.contractor_trade_capabilities
AS RESTRICTIVE
FOR ALL
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'organiser')
  OR public.has_role(auth.uid(), 'lead_organiser')
);
