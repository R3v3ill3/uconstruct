-- Add the new enum value to the existing rating_type enum
ALTER TYPE rating_type ADD VALUE 'activity_participation';

-- Update all existing records to use the new type
UPDATE worker_activity_ratings 
SET rating_type = 'activity_participation';

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