-- 1) Make payment-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- 2) Remove permissive public read on payment-screenshots
DROP POLICY IF EXISTS "Anyone can read payment screenshots" ON storage.objects;

-- 3) Allow only admins to read payment screenshots
CREATE POLICY "Admins can read payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots' AND has_role(auth.uid(), 'admin'::app_role));

-- 4) Lock down user_roles writes: explicit deny for non-admins on INSERT/UPDATE/DELETE.
-- Admins can manage via existing patterns; here we make intent explicit.
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));