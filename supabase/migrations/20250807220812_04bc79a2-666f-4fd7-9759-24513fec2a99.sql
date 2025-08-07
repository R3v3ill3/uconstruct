-- Ensure trigger exists for user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to manually sync users (in case of missed profiles)
CREATE OR REPLACE FUNCTION public.sync_auth_users()
RETURNS TABLE(synced_count integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sync_count integer := 0;
BEGIN
  -- Insert profiles for auth users that don't have them
  WITH missing_profiles AS (
    INSERT INTO public.profiles (id, email, full_name)
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', au.email)
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO sync_count FROM missing_profiles;
  
  RETURN QUERY SELECT sync_count, 
    CASE 
      WHEN sync_count > 0 THEN format('Synced %s users successfully', sync_count)
      ELSE 'All users already synced'
    END;
END;
$$;