/*
  # Create food logs table

  1. New Tables
    - `food_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `plan_details` (jsonb)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `food_logs` table
    - Add policies for authenticated users to:
      - Create their own logs
      - Read their own logs
      - Delete their own logs
*/

CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  plan_details jsonb NOT NULL,
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own logs
CREATE POLICY "Users can create their own logs"
  ON food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own logs
CREATE POLICY "Users can read their own logs"
  ON food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own logs
CREATE POLICY "Users can delete their own logs"
  ON food_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);