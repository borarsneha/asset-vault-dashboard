-- Fix the function search path security issue
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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