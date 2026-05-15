-- Add goal_days column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS goal_days INTEGER DEFAULT 30;
