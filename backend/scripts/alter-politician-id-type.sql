-- First, drop the view that depends on the politicians table
DROP VIEW IF EXISTS politician_summary;

-- Drop foreign key constraints that reference politicians.id
ALTER TABLE statements DROP CONSTRAINT IF EXISTS statements_politician_id_fkey;
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_politician_id_fkey;

-- Change the ID column type from UUID to VARCHAR
ALTER TABLE politicians 
  ALTER COLUMN id TYPE VARCHAR(20),
  ALTER COLUMN id DROP DEFAULT;

-- Change the politician_id columns in related tables
ALTER TABLE statements 
  ALTER COLUMN politician_id TYPE VARCHAR(20);

ALTER TABLE scores 
  ALTER COLUMN politician_id TYPE VARCHAR(20);

-- Re-add the foreign key constraints
ALTER TABLE statements 
  ADD CONSTRAINT statements_politician_id_fkey 
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE;

ALTER TABLE scores 
  ADD CONSTRAINT scores_politician_id_fkey 
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE;

-- Recreate the view
CREATE VIEW politician_summary AS
SELECT 
    p.id,
    p.name,
    p.party,
    p.state,
    p.position,
    COUNT(DISTINCT s.id) AS statement_count,
    AVG(sc.score) AS average_score,
    MAX(s.date) AS latest_statement_date,
    MAX(sc.last_updated) AS latest_score_update
FROM 
    politicians p
LEFT JOIN 
    statements s ON p.id = s.politician_id
LEFT JOIN 
    scores sc ON p.id = sc.politician_id
GROUP BY 
    p.id, p.name, p.party, p.state, p.position;
