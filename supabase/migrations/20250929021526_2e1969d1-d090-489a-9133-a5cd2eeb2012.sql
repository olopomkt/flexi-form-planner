-- Create planners_history table
CREATE TABLE public.planners_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_inputs JSONB NOT NULL,
  ai_outputs JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.planners_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own planners" 
ON public.planners_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planners" 
ON public.planners_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);