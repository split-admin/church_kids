
/*
  # Children's Church Attendance System

  ## Summary
  Creates the core tables for managing children's attendance at church events.

  ## New Tables

  ### `children`
  Stores registered children with their personal and family information.
  - `id` (uuid, primary key)
  - `full_name` (text) - child's full name
  - `birthdate` (date) - date of birth
  - `photo_url` (text) - URL to stored profile photo
  - `parent1_name` (text) - first parent/guardian name
  - `parent1_phone` (text) - first parent/guardian phone
  - `parent2_name` (text, nullable) - second parent/guardian name
  - `parent2_phone` (text, nullable) - second parent/guardian phone
  - `notes` (text, nullable) - allergies, special needs, etc.
  - `created_at` (timestamptz)

  ### `attendance`
  Records each time a child checks in to a service or event.
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key → children)
  - `checked_in_at` (timestamptz) - timestamp of check-in
  - `event_date` (date) - the date of the service/event
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Policies allow authenticated users full access (church staff)
  - Anon users can read children list (for kiosk check-in mode)
*/

CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birthdate date,
  photo_url text DEFAULT '',
  parent1_name text NOT NULL DEFAULT '',
  parent1_phone text NOT NULL DEFAULT '',
  parent2_name text DEFAULT '',
  parent2_phone text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS attendance_child_id_idx ON attendance(child_id);
CREATE INDEX IF NOT EXISTS attendance_event_date_idx ON attendance(event_date);
CREATE INDEX IF NOT EXISTS children_full_name_idx ON children(full_name);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Children policies
CREATE POLICY "Authenticated users can view children"
  ON children FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update children"
  ON children FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete children"
  ON children FOR DELETE
  TO authenticated
  USING (true);

-- Anon read for kiosk mode
CREATE POLICY "Anon can view children for check-in"
  ON children FOR SELECT
  TO anon
  USING (true);

-- Attendance policies
CREATE POLICY "Authenticated users can view attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (true);

-- Anon insert for kiosk check-in
CREATE POLICY "Anon can insert attendance for check-in"
  ON attendance FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view attendance"
  ON attendance FOR SELECT
  TO anon
  USING (true);
