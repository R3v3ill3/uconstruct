-- Create RPC to perform employer update with elevated privileges and sync tags/trades
CREATE OR REPLACE FUNCTION public.admin_update_employer_full(
  p_employer_id uuid,
  p_update jsonb,
  p_role_tags public.employer_role_tag[] DEFAULT NULL,
  p_trade_caps text[] DEFAULT NULL
)
RETURNS public.employers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.employers%ROWTYPE;
BEGIN
  -- Authorization: require admin or organiser/lead_organiser/delegate
  IF NOT (
    public.is_admin()
    OR public.has_role(auth.uid(), 'organiser')
    OR public.has_role(auth.uid(), 'lead_organiser')
    OR public.has_role(auth.uid(), 'delegate')
  ) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Update employer record using provided JSON keys
  UPDATE public.employers e
  SET
    name = COALESCE(NULLIF(p_update->>'name',''), e.name),
    employer_type = COALESCE(NULLIF(p_update->>'employer_type',''), e.employer_type),
    abn = CASE WHEN p_update ? 'abn' THEN NULLIF(p_update->>'abn','') ELSE e.abn END,
    primary_contact_name = CASE WHEN p_update ? 'primary_contact_name' THEN NULLIF(p_update->>'primary_contact_name','') ELSE e.primary_contact_name END,
    phone = CASE WHEN p_update ? 'phone' THEN NULLIF(p_update->>'phone','') ELSE e.phone END,
    email = CASE WHEN p_update ? 'email' THEN NULLIF(p_update->>'email','') ELSE e.email END,
    website = CASE WHEN p_update ? 'website' THEN NULLIF(p_update->>'website','') ELSE e.website END,
    address_line_1 = CASE WHEN p_update ? 'address_line_1' THEN NULLIF(p_update->>'address_line_1','') ELSE e.address_line_1 END,
    address_line_2 = CASE WHEN p_update ? 'address_line_2' THEN NULLIF(p_update->>'address_line_2','') ELSE e.address_line_2 END,
    suburb = CASE WHEN p_update ? 'suburb' THEN NULLIF(p_update->>'suburb','') ELSE e.suburb END,
    state = CASE WHEN p_update ? 'state' THEN NULLIF(p_update->>'state','') ELSE e.state END,
    postcode = CASE WHEN p_update ? 'postcode' THEN NULLIF(p_update->>'postcode','') ELSE e.postcode END,
    contact_notes = CASE WHEN p_update ? 'contact_notes' THEN NULLIF(p_update->>'contact_notes','') ELSE e.contact_notes END,
    estimated_worker_count = CASE WHEN p_update ? 'estimated_worker_count' THEN NULLIF(p_update->>'estimated_worker_count','')::int ELSE e.estimated_worker_count END,
    enterprise_agreement_status = CASE WHEN p_update ? 'enterprise_agreement_status' THEN
      CASE
        WHEN p_update->>'enterprise_agreement_status' IS NULL THEN NULL
        ELSE (p_update->>'enterprise_agreement_status')::boolean
      END
    ELSE e.enterprise_agreement_status END,
    updated_at = now()
  WHERE e.id = p_employer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employer not found';
  END IF;

  -- Sync role tags
  IF p_role_tags IS NULL THEN
    DELETE FROM public.employer_role_tags WHERE employer_id = p_employer_id;
  ELSE
    DELETE FROM public.employer_role_tags
    WHERE employer_id = p_employer_id
      AND NOT (tag = ANY (p_role_tags));

    INSERT INTO public.employer_role_tags (employer_id, tag)
    SELECT p_employer_id, t
    FROM unnest(p_role_tags) AS t
    ON CONFLICT (employer_id, tag) DO NOTHING;
  END IF;

  -- Sync trade capabilities
  IF p_trade_caps IS NULL THEN
    DELETE FROM public.contractor_trade_capabilities WHERE employer_id = p_employer_id;
  ELSE
    DELETE FROM public.contractor_trade_capabilities
    WHERE employer_id = p_employer_id
      AND NOT (trade_type::text = ANY (p_trade_caps));

    INSERT INTO public.contractor_trade_capabilities (employer_id, trade_type, is_primary)
    SELECT p_employer_id, v::public.trade_type, false
    FROM unnest(p_trade_caps) AS v
    WHERE NOT EXISTS (
      SELECT 1 FROM public.contractor_trade_capabilities c
      WHERE c.employer_id = p_employer_id AND c.trade_type::text = v
    );
  END IF;

  SELECT * INTO v_row FROM public.employers WHERE id = p_employer_id;
  RETURN v_row;
END;
$function$;

-- Allow authenticated users to execute this function
GRANT EXECUTE ON FUNCTION public.admin_update_employer_full(uuid, jsonb, public.employer_role_tag[], text[]) TO authenticated;