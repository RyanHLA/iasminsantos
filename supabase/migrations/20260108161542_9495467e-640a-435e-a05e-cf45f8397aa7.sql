-- Create admin settings table to store admin PIN securely
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- No public access - only accessible via security definer functions
-- (intentionally no policies to prevent direct access)

-- Insert the admin PIN
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('admin_pin', 'Ias87281!')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Create secure verification function
CREATE OR REPLACE FUNCTION public.verify_admin_pin(pin_attempt TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_settings 
    WHERE setting_key = 'admin_pin' 
      AND setting_value = pin_attempt
  );
$$;