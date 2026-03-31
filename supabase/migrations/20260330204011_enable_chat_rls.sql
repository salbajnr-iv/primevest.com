-- @ts-check
-- PostgreSQL migration for Supabase
-- Enable Row Level Security on chat_conversations table
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for anonymous users on chat_conversations
CREATE POLICY "Enable all access for anon"
ON chat_conversations
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Enable Row Level Security on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for anonymous users on chat_messages
CREATE POLICY "Enable all access for anon"
ON chat_messages
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
