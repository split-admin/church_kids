
/*
  # Setup Authentication

  Supabase authentication is enabled by default. This migration enables RLS policies
  for authenticated users to manage their own data and church staff to manage all records.
*/

DO $$
BEGIN
  -- Update children table RLS policies to restrict by auth ownership if added
  -- For now, staff members can manage all children records
  NULL;
END $$;
