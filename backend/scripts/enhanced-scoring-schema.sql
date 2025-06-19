-- Enhanced Scoring System Migration
-- This script adds new tables and fields to support the enhanced politician scoring system

-- New table for politician committee memberships
CREATE TABLE IF NOT EXISTS politician_committees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  committee_name VARCHAR(255) NOT NULL,
  leadership_position VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- New table for evidence quality tracking
CREATE TABLE IF NOT EXISTS evidence_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scoring_action_id UUID NOT NULL REFERENCES scoring_actions(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- official_record, investigative_journalism, first_party, social_media
  confidence_rating INTEGER NOT NULL CHECK (confidence_rating BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extend scoring_actions table with new fields
ALTER TABLE scoring_actions
ADD COLUMN IF NOT EXISTS strategic_value VARCHAR(20),
ADD COLUMN IF NOT EXISTS has_action_follow_up BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS impact_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS strategic_function VARCHAR(20),
ADD COLUMN IF NOT EXISTS performance_modifier DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS contradiction_flag BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contradiction_notes TEXT;

-- Add new fields to politician_scores for enhanced evaluation
ALTER TABLE politician_scores
ADD COLUMN IF NOT EXISTS strategic_integrity_score INTEGER CHECK (strategic_integrity_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS infrastructure_understanding_score INTEGER CHECK (infrastructure_understanding_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS performance_vs_impact_score INTEGER CHECK (performance_vs_impact_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS resistance_level VARCHAR(50);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_politician_committees_politician_id ON politician_committees(politician_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_scoring_action_id ON evidence_sources(scoring_action_id);
CREATE INDEX IF NOT EXISTS idx_scoring_actions_strategic_value ON scoring_actions(strategic_value);
CREATE INDEX IF NOT EXISTS idx_scoring_actions_impact_level ON scoring_actions(impact_level);
CREATE INDEX IF NOT EXISTS idx_politician_scores_resistance_level ON politician_scores(resistance_level);

-- Add audit triggers for new tables
CREATE TRIGGER update_politician_committees_timestamp
BEFORE UPDATE ON politician_committees
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_evidence_sources_timestamp
BEFORE UPDATE ON evidence_sources
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create view for enhanced politician assessment
CREATE OR REPLACE VIEW enhanced_politician_assessment AS
SELECT 
    p.id,
    p.name,
    p.party,
    p.state,
    p.position,
    p.photo_url,
    ps.total_score,
    ps.public_statements_score,
    ps.legislative_action_score,
    ps.public_engagement_score,
    ps.social_media_score,
    ps.consistency_score,
    ps.strategic_integrity_score,
    ps.infrastructure_understanding_score,
    ps.performance_vs_impact_score,
    ps.days_of_silence,
    ps.last_activity_date,
    ps.resistance_level,
    CASE
        WHEN ps.total_score >= 80 THEN 'WHISTLEBLOWER'
        WHEN ps.total_score >= 50 THEN 'UNDER SURVEILLANCE'
        ELSE 'PERSON OF INTEREST'
    END AS status,
    (SELECT array_agg(committee_name) FROM politician_committees WHERE politician_id = p.id) AS committees,
    (SELECT array_agg(leadership_position) FROM politician_committees WHERE politician_id = p.id AND leadership_position IS NOT NULL) AS leadership_positions,
    (SELECT COUNT(*) FROM scoring_actions WHERE politician_id = p.id AND contradiction_flag = TRUE) AS contradiction_count,
    (SELECT COUNT(*) FROM scoring_actions 
     WHERE politician_id = p.id 
     AND action_date >= (CURRENT_DATE - INTERVAL '14 days')) AS actions_last_14_days
FROM 
    politicians p
LEFT JOIN 
    politician_scores ps ON p.id = ps.politician_id;

-- Create view for contradiction analysis
CREATE OR REPLACE VIEW politician_contradictions AS
SELECT 
    p.id AS politician_id,
    p.name AS politician_name,
    sa1.id AS statement_action_id,
    sa1.description AS statement_description,
    sa1.action_date AS statement_date,
    sa2.id AS contradicting_action_id,
    sa2.description AS contradicting_action,
    sa2.action_date AS contradiction_date,
    sa1.contradiction_notes
FROM 
    politicians p
JOIN 
    scoring_actions sa1 ON p.id = sa1.politician_id
JOIN 
    scoring_actions sa2 ON p.id = sa2.politician_id
WHERE 
    sa1.contradiction_flag = TRUE
    AND sa1.id != sa2.id
    AND sa1.contradiction_notes LIKE '%' || sa2.id || '%';
