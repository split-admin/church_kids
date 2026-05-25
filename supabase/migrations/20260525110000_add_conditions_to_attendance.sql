-- Alter attendance table to add physical and emotional condition columns
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS physical_condition text DEFAULT '',
ADD COLUMN IF NOT EXISTS emotional_condition text DEFAULT '';
