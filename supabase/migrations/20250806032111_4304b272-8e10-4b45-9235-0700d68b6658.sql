-- Update the user role to admin so they can manage EBA data
UPDATE profiles SET role = 'admin' WHERE email = 'troyburton@gmail.com';