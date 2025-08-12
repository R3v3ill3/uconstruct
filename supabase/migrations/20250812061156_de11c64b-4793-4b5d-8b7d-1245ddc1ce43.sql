-- Fix type casting in admin_update_employer_full function
CREATE OR REPLACE FUNCTION public.admin_update_employer_full(
  p_employer_id uuid,
  p_update jsonb,
  p_role_tags employer_role_tag[],
  p_trade_types trade_type[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check permissions
  IF NOT (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser'])) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Update employer with proper type casting
  UPDATE public.employers e
  SET 
    name = COALESCE(p_update->>'name', e.name),
    employer_type = COALESCE((p_update->>'employer_type')::employer_type, e.employer_type),
    abn = COALESCE(p_update->>'abn', e.abn),
    email = COALESCE(p_update->>'email', e.email),
    phone = COALESCE(p_update->>'phone', e.phone),
    website = COALESCE(p_update->>'website', e.website),
    address_line_1 = COALESCE(p_update->>'address_line_1', e.address_line_1),
    address_line_2 = COALESCE(p_update->>'address_line_2', e.address_line_2),
    suburb = COALESCE(p_update->>'suburb', e.suburb),
    state = COALESCE(p_update->>'state', e.state),
    postcode = COALESCE(p_update->>'postcode', e.postcode),
    primary_contact_name = COALESCE(p_update->>'primary_contact_name', e.primary_contact_name),
    contact_notes = COALESCE(p_update->>'contact_notes', e.contact_notes),
    estimated_worker_count = COALESCE((p_update->>'estimated_worker_count')::integer, e.estimated_worker_count),
    enterprise_agreement_status = COALESCE((p_update->>'enterprise_agreement_status')::boolean, e.enterprise_agreement_status),
    updated_at = now()
  WHERE e.id = p_employer_id;

  -- Handle role tags
  IF p_role_tags IS NOT NULL THEN
    -- Delete existing tags
    DELETE FROM public.employer_role_tags WHERE employer_id = p_employer_id;
    
    -- Insert new tags
    IF array_length(p_role_tags, 1) > 0 THEN
      INSERT INTO public.employer_role_tags (employer_id, tag)
      SELECT p_employer_id, unnest(p_role_tags);
    END IF;
  END IF;

  -- Handle trade capabilities
  IF p_trade_types IS NOT NULL THEN
    -- Delete existing capabilities
    DELETE FROM public.contractor_trade_capabilities WHERE employer_id = p_employer_id;
    
    -- Insert new capabilities
    IF array_length(p_trade_types, 1) > 0 THEN
      INSERT INTO public.contractor_trade_capabilities (employer_id, trade_type, is_primary)
      SELECT p_employer_id, unnest(p_trade_types), false;
    END IF;
  END IF;
END;
$$;