-- Create profile for the super admin user if it doesn't exist
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  '37d54bf4-985d-4a5a-9b6d-7a0ab476ecc0',
  'connect.appmaster@gmail.com',
  'Super Admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '37d54bf4-985d-4a5a-9b6d-7a0ab476ecc0'
);

-- Fix RLS policies to allow users to read their own roles properly
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create simplified policy for users to read their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policy for admins to view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

-- Allow super admins to update roles
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Allow super admins to insert roles
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);