-- Extend trade_type enum with missing trade types
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'tower_crane';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'mobile_crane';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'demolition';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'scaffolding';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'post_tensioning';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'concreting';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'form_work';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'steel_fixing';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'bricklaying';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'traffic_control';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'labour_hire';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'carpentry';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'windows';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'painting';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'waterproofing';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'plastering';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'edge_protection';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'hoist';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'kitchens';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'tiling';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'cleaning';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'flooring';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'structural_steel';
ALTER TYPE trade_type ADD VALUE IF NOT EXISTS 'landscaping';

-- Add contact detail columns to employers table
ALTER TABLE employers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS address_line_1 text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS address_line_2 text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS suburb text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS contact_notes text;

-- Create enum for EBA status
CREATE TYPE eba_status_type AS ENUM ('yes', 'no', 'not_specified');

-- Update site_contractor_trades to use proper EBA status enum
ALTER TABLE site_contractor_trades ADD COLUMN IF NOT EXISTS eba_signatory eba_status_type DEFAULT 'not_specified';

-- Create a table to store contractor trade capabilities (many-to-many relationship)
CREATE TABLE IF NOT EXISTS contractor_trade_capabilities (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id uuid REFERENCES employers(id) ON DELETE CASCADE,
    trade_type trade_type NOT NULL,
    is_primary boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(employer_id, trade_type)
);

-- Enable RLS on contractor_trade_capabilities
ALTER TABLE contractor_trade_capabilities ENABLE ROW LEVEL SECURITY;

-- Create policies for contractor_trade_capabilities
CREATE POLICY "Admins and organisers can manage contractor trade capabilities"
ON contractor_trade_capabilities
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view contractor trade capabilities"
ON contractor_trade_capabilities
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_contractor_trade_capabilities_updated_at
BEFORE UPDATE ON contractor_trade_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();