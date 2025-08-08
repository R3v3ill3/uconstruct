` block. I also want to add a brief note either before or after the block, as the instructions say to include the SQL commands and request user approval. 

Additionally, I can add a link to the SQL editor, as the guidelines mention this is allowed. After I get the user’s approval, I’ll plan to refactor the address input to use the shared key and remove the prompt for the API key. Let’s proceed!" duration="2.404689">
</lov-tool-use>
Great — thanks for adding the Google Maps API key. First, I’ll prepare the database to store geocoding data for job sites (place_id, latitude, longitude). Please review and approve the SQL below to run it.

<lov-sql>
-- Add geocoding fields to job_sites for future mapping
ALTER TABLE public.job_sites
  ADD COLUMN IF NOT EXISTS place_id text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS job_sites_place_id_idx ON public.job_sites (place_id);
CREATE INDEX IF NOT EXISTS job_sites_lat_lng_idx ON public.job_sites (latitude, longitude);
