
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert visitor records (anonymous tracking)
CREATE POLICY "Anyone can insert visitors" ON public.visitors
  FOR INSERT WITH CHECK (true);

-- Only admins can read visitor data
CREATE POLICY "Admins can read visitors" ON public.visitors
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete visitor data
CREATE POLICY "Admins can delete visitors" ON public.visitors
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
