-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create portfolios policies
CREATE POLICY "Users can view their own portfolios" 
ON public.portfolios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios" 
ON public.portfolios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" 
ON public.portfolios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" 
ON public.portfolios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create investment_types enum
CREATE TYPE public.investment_type AS ENUM ('stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'other');

-- Create investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type investment_type NOT NULL DEFAULT 'stock',
  purchase_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,4) NOT NULL,
  current_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create investments policies
CREATE POLICY "Users can view investments in their portfolios" 
ON public.investments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = investments.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can create investments in their portfolios" 
ON public.investments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = investments.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can update investments in their portfolios" 
ON public.investments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = investments.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can delete investments in their portfolios" 
ON public.investments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = investments.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM ('buy', 'sell');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES public.investments(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  quantity DECIMAL(10,4) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create transactions policies
CREATE POLICY "Users can view transactions in their portfolios" 
ON public.transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = transactions.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can create transactions in their portfolios" 
ON public.transactions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.portfolios 
  WHERE portfolios.id = transactions.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  -- Create a default portfolio for new users
  INSERT INTO public.portfolios (user_id, name, description)
  VALUES (new.id, 'My Portfolio', 'Default portfolio for tracking investments');
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();