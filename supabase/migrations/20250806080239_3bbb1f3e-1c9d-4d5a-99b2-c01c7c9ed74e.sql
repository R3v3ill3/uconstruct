-- Update rating_type enum to focus on activity participation
-- First drop existing enum if it exists and recreate
DO $$ BEGIN
    -- Drop enum if it exists
    DROP TYPE IF EXISTS rating_type CASCADE;
    
    -- Create new rating_type enum for activity participation
    CREATE TYPE rating_type AS ENUM ('activity_participation');
END $$;

-- Add check constraint to ensure rating_value is between 1-5 when not null
ALTER TABLE worker_activity_ratings 
ADD CONSTRAINT check_rating_value_range 
CHECK (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 5));

-- Update existing records to use the new rating type
UPDATE worker_activity_ratings 
SET rating_type = 'activity_participation' 
WHERE rating_type IS NOT NULL;

-- Add index for better performance on activity-based queries
CREATE INDEX IF NOT EXISTS idx_worker_activity_ratings_activity_worker 
ON worker_activity_ratings(activity_id, worker_id);

-- Add index for worker-based rating queries
CREATE INDEX IF NOT EXISTS idx_worker_activity_ratings_worker_activity 
ON worker_activity_ratings(worker_id, activity_id);

-- Add comment to clarify the rating scale
COMMENT ON COLUMN worker_activity_ratings.rating_value IS 
'Activity participation rating: 1=Supporter Activist, 2=Supporter, 3=Undecided, 4=Opposed, 5=Opposed Activist. NULL=Unassessed';