-- Add per-project contractor workforce estimate
ALTER TABLE public.project_contractor_trades
ADD COLUMN IF NOT EXISTS estimated_project_workforce integer;

COMMENT ON COLUMN public.project_contractor_trades.estimated_project_workforce IS 'User-entered estimate of this contractor\'s workforce on this project';

-- Optional index to help aggregations
CREATE INDEX IF NOT EXISTS idx_pct_project_estimate
ON public.project_contractor_trades (project_id, employer_id, estimated_project_workforce);