# Fix for "Save failed {}" Error in Profile Page

## Problem
The "Save failed {}" error occurs when trying to save profile updates. This is caused by Supabase RLS (Row Level Security) policies not properly handling the upsert operation on the profiles table.

## Root Cause
- The profiles table has separate INSERT and UPDATE policies
- Upsert requires BOTH operations to succeed simultaneously
- The current policies may not properly handle upsert operations

## Solution

### Step 1: Apply RLS Policy Fix
Run the following SQL in your Supabase SQL Editor to add a proper upsert policy:

```sql
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a combined INSERT/UPDATE policy for users to manage their own profile
CREATE POLICY "Users can upsert own profile" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Step 2: Verify Supabase Environment Variables
Ensure your `.env.local` file has these variables set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Test the Profile Save
1. Navigate to Profile page
2. Click "Edit"
3. Make changes and click "Save"
4. Check browser console for any errors

## Alternative: If Step 1 Doesn't Work
Try this more permissive policy:

```sql
-- Create separate policies for INSERT and UPDATE
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

## Debugging Steps
If the error persists:

1. Check browser console for detailed error
2. Run this query in Supabase SQL Editor to check your profile:
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

3. Verify RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

4. Check if profiles table exists and has correct structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

## Files Modified
- `app/profile/page.tsx` - Enhanced error handling and logging

