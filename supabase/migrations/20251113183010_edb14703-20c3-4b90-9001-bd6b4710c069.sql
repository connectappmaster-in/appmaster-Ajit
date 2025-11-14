-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled', 'payment_failed');

-- Create enum for tool category
CREATE TYPE tool_category AS ENUM ('finance', 'hr', 'it', 'shop', 'manufacturing', 'sales', 'marketing', 'productivity', 'custom');

-- Create enum for log action type
CREATE TYPE log_action_type AS ENUM ('user_login', 'user_logout', 'user_created', 'user_updated', 'user_deleted', 'role_changed', 'subscription_created', 'subscription_updated', 'tool_enabled', 'tool_disabled', 'payment_success', 'payment_failed', 'settings_updated');

-- Create tools table
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category tool_category NOT NULL,
  icon TEXT,
  route TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pricing table
CREATE TABLE public.pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  price_per_month DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  status subscription_status DEFAULT 'trial',
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Create billing table
CREATE TABLE public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending',
  payment_gateway TEXT,
  transaction_id TEXT,
  invoice_url TEXT,
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action log_action_type NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tools
CREATE POLICY "Anyone can view active tools" ON public.tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tools" ON public.tools
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for pricing
CREATE POLICY "Anyone can view active pricing" ON public.pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing" ON public.pricing
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for billing
CREATE POLICY "Users can view their own billing" ON public.billing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all billing" ON public.billing
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can manage billing" ON public.billing
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all logs" ON public.audit_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can insert logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can manage tickets" ON public.support_tickets
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for system_settings
CREATE POLICY "Admins can view settings" ON public.system_settings
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Super admins can manage settings" ON public.system_settings
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_tools
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_pricing
  BEFORE UPDATE ON public.pricing
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_support_tickets
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_system_settings
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed tools data
INSERT INTO public.tools (name, display_name, description, category, route) VALUES
  ('depreciation', 'Depreciation', 'Manage asset depreciation', 'finance', '/depreciation'),
  ('invoicing', 'Invoicing', 'Create and manage invoices', 'finance', '/invoicing'),
  ('attendance', 'Attendance', 'Track employee attendance', 'hr', '/attendance'),
  ('recruitment', 'Recruitment', 'Manage recruitment process', 'hr', '/recruitment'),
  ('tickets', 'Tickets Handling', 'IT support ticket management', 'it', '/tickets'),
  ('subscriptions', 'Subscriptions', 'Manage subscriptions', 'it', '/subscriptions'),
  ('assets', 'Assets', 'IT asset management', 'it', '/assets'),
  ('shop-income-expense', 'Shop Income & Expense', 'Track shop finances', 'shop', '/shop-income-expense'),
  ('inventory', 'Inventory', 'Manage inventory', 'manufacturing', '/inventory'),
  ('crm', 'CRM', 'Customer relationship management', 'sales', '/crm'),
  ('marketing', 'Marketing', 'Marketing tools', 'marketing', '/marketing'),
  ('personal-expense', 'Personal Expense Tracker', 'Track personal expenses', 'productivity', '/personal-expense'),
  ('contact', 'Contact Us', 'Contact support', 'custom', '/contact');

-- Seed pricing data (₹99/month per tool)
INSERT INTO public.pricing (tool_id, price_per_month)
SELECT id, 99.00 FROM public.tools;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('trial_duration_months', '6', 'Default trial duration in months'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('default_currency', '"INR"', 'Default currency for billing'),
  ('payment_gateways', '["razorpay", "stripe"]', 'Enabled payment gateways');

-- Create function to initialize user trial subscriptions
CREATE OR REPLACE FUNCTION public.initialize_user_subscriptions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tool_record RECORD;
  trial_end TIMESTAMPTZ;
BEGIN
  -- Calculate trial end date (6 months from now)
  trial_end := NOW() + INTERVAL '6 months';
  
  -- Create trial subscriptions for all active tools
  FOR tool_record IN SELECT id FROM public.tools WHERE is_active = true
  LOOP
    INSERT INTO public.subscriptions (user_id, tool_id, status, trial_start_date, trial_end_date)
    VALUES (NEW.id, tool_record.id, 'trial', NOW(), trial_end);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create trial subscriptions for new users
CREATE TRIGGER on_user_created_subscriptions
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_subscriptions();