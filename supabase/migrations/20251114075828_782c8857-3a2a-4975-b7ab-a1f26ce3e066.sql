-- Create enum for applicable laws
CREATE TYPE applicable_law AS ENUM ('Companies Act', 'Income Tax Act', 'Both');

-- Create enum for depreciation methods
CREATE TYPE depreciation_method AS ENUM ('SLM', 'WDV');

-- Create enum for asset transaction types
CREATE TYPE transaction_type AS ENUM ('Addition', 'Disposal');

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  applicable_law applicable_law NOT NULL,
  asset_category TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  original_cost DECIMAL(15, 2) NOT NULL,
  useful_life INTEGER NOT NULL,
  residual_value_pct DECIMAL(5, 2) DEFAULT 5.00,
  depreciation_rate DECIMAL(5, 2) NOT NULL,
  depreciation_method depreciation_method NOT NULL,
  multi_shift_use INTEGER DEFAULT 1, -- 1 = single, 2 = double, 3 = triple
  additional_depreciation_eligible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset transactions table (additions/disposals)
CREATE TABLE public.asset_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create depreciation schedules table
CREATE TABLE public.depreciation_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  year_number INTEGER NOT NULL,
  financial_year TEXT NOT NULL,
  opening_value DECIMAL(15, 2) NOT NULL,
  additions DECIMAL(15, 2) DEFAULT 0,
  disposals DECIMAL(15, 2) DEFAULT 0,
  depreciation DECIMAL(15, 2) NOT NULL,
  additional_depreciation DECIMAL(15, 2) DEFAULT 0,
  accumulated_depreciation DECIMAL(15, 2) NOT NULL,
  closing_value DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_residual_value_pct DECIMAL(5, 2) DEFAULT 5.00,
  default_depreciation_method depreciation_method DEFAULT 'WDV',
  enable_multi_shift BOOLEAN DEFAULT true,
  enable_additional_depreciation BOOLEAN DEFAULT true,
  fy_start_month INTEGER DEFAULT 4, -- April
  fy_start_day INTEGER DEFAULT 1,
  company_name TEXT,
  company_address TEXT,
  company_logo_url TEXT,
  currency_symbol TEXT DEFAULT '₹',
  theme_mode TEXT DEFAULT 'light',
  auto_save_interval INTEGER DEFAULT 30, -- seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assets
CREATE POLICY "Users can view their own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for asset_transactions
CREATE POLICY "Users can view their own asset transactions"
  ON public.asset_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = asset_transactions.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own asset transactions"
  ON public.asset_transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = asset_transactions.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own asset transactions"
  ON public.asset_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = asset_transactions.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own asset transactions"
  ON public.asset_transactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = asset_transactions.asset_id
    AND assets.user_id = auth.uid()
  ));

-- RLS Policies for depreciation_schedules
CREATE POLICY "Users can view their own depreciation schedules"
  ON public.depreciation_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = depreciation_schedules.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own depreciation schedules"
  ON public.depreciation_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = depreciation_schedules.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own depreciation schedules"
  ON public.depreciation_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = depreciation_schedules.asset_id
    AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own depreciation schedules"
  ON public.depreciation_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.assets
    WHERE assets.id = depreciation_schedules.asset_id
    AND assets.user_id = auth.uid()
  ));

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_asset_transactions_asset_id ON public.asset_transactions(asset_id);
CREATE INDEX idx_depreciation_schedules_asset_id ON public.depreciation_schedules(asset_id);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);