-- Add system message support to messages table
-- Run this in your Supabase SQL editor

-- Add is_system_message column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN DEFAULT FALSE;

-- Create index for system messages if needed
CREATE INDEX IF NOT EXISTS idx_messages_system ON public.messages(is_system_message) WHERE is_system_message = TRUE;

-- Update existing messages to ensure they're not system messages
UPDATE public.messages 
SET is_system_message = FALSE 
WHERE is_system_message IS NULL;
