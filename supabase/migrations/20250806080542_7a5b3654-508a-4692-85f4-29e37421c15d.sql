-- Update rating_type enum to focus on activity participation
-- First create the new enum
CREATE TYPE rating_type_new AS ENUM ('activity_participation');

-- Add the new column temporarily
ALTER TABLE worker_activity_ratings 
ADD COLUMN rating_type_new rating_type_new DEFAULT 'activity_participation';

-- Update all existing records to use the new type
UPDATE worker_activity_ratings 
SET rating_type_new = 'activity_participation';

-- Drop the old column and rename the new one
ALTER TABLE worker_activity_ratings DROP COLUMN rating_type;
ALTER TABLE worker_activity_ratings RENAME COLUMN rating_type_new TO rating_type;

-- Set the column as NOT NULL
ALTER TABLE worker_activity_ratings ALTER COLUMN rating_type SET NOT NULL;

-- Drop the old enum type
DROP TYPE IF EXISTS rating_type_old CASCADE;

-- Rename the new type to the original name
ALTER TYPE rating_type_new RENAME TO rating_type;

-- Add check constraint to ensure rating_value is between 1-5 when not null
ALTER TABLE worker_activity_ratings 
ADD CONSTRAINT check_rating_value_range 
CHECK (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 5));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_worker_activity_ratings_activity_worker 
ON worker_activity_ratings(activity_id, worker_id);

CREATE INDEX IF NOT EXISTS idx_worker_activity_ratings_worker_activity 
ON worker_activity_ratings(worker_id, activity_id);

-- Add comment to clarify the rating scale
COMMENT ON COLUMN worker_activity_ratings.rating_value IS 
'Activity participation rating: 1=Supporter Activist, 2=Supporter, 3=Undecided, 4=Opposed, 5=Opposed Activist. NULL=Unassessed';