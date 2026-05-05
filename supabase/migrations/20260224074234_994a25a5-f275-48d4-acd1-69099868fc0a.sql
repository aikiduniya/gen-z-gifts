
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload payment screenshots
CREATE POLICY "Anyone can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow anyone to read payment screenshots
CREATE POLICY "Anyone can read payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Allow admins to delete payment screenshots
CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- Add payment_method and payment_screenshot_url columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url text DEFAULT NULL;
