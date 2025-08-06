-- Update the user role to admin after they sign up
-- Replace the email with the actual user email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'karmalord999@gmail.com';