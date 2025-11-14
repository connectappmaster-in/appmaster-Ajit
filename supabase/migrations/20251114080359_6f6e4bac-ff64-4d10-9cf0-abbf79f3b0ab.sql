-- Fix infinite recursion in user_roles RLS by using a security definer function

-- 1) Create or replace a helper function that checks roles without querying inside a policy
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 2) Replace recursive policies on user_roles
-- Drop offending policies if they exist
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;

-- Re-create policies using the has_role() function to avoid recursion
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin')
);

-- Keep existing policy allowing users to see their own role (do not drop)
-- Existing policy: "Users can view their own role" FOR SELECT USING (user_id = auth.uid());
