-- Create watchlist table for tracking stocks of interest
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id UUID,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  sector TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlist access
CREATE POLICY "Users can view their own watchlist items" 
ON public.watchlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlist items" 
ON public.watchlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items" 
ON public.watchlist 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items" 
ON public.watchlist 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_portfolio_id ON public.watchlist(portfolio_id);