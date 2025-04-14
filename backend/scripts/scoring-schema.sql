-- Project 2025 Opposition Scoring System Schema

-- Create politician_scores table (main table with current total scores)
CREATE TABLE politician_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    public_statements_score INTEGER NOT NULL CHECK (public_statements_score >= 0 AND public_statements_score <= 100),
    legislative_action_score INTEGER NOT NULL CHECK (legislative_action_score >= 0 AND legislative_action_score <= 100),
    public_engagement_score INTEGER NOT NULL CHECK (public_engagement_score >= 0 AND public_engagement_score <= 100),
    social_media_score INTEGER NOT NULL CHECK (social_media_score >= 0 AND social_media_score <= 100),
    consistency_score INTEGER NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 100),
    days_of_silence INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create score_history table (tracks score changes over time)
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    public_statements_score INTEGER NOT NULL CHECK (public_statements_score >= 0 AND public_statements_score <= 100),
    legislative_action_score INTEGER NOT NULL CHECK (legislative_action_score >= 0 AND legislative_action_score <= 100),
    public_engagement_score INTEGER NOT NULL CHECK (public_engagement_score >= 0 AND public_engagement_score <= 100),
    social_media_score INTEGER NOT NULL CHECK (social_media_score >= 0 AND social_media_score <= 100),
    consistency_score INTEGER NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 100),
    days_of_silence INTEGER NOT NULL DEFAULT 0,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create score_components table (stores individual category scores)
CREATE TABLE score_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scoring_actions table (records specific actions that affect scores)
CREATE TABLE scoring_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_date DATE NOT NULL,
    description TEXT NOT NULL,
    source_url TEXT,
    points INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    time_value DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_politician_scores_politician_id ON politician_scores(politician_id);
CREATE INDEX idx_score_history_politician_id ON score_history(politician_id);
CREATE INDEX idx_score_history_recorded_date ON score_history(recorded_date);
CREATE INDEX idx_score_components_politician_id ON score_components(politician_id);
CREATE INDEX idx_score_components_category ON score_components(category);
CREATE INDEX idx_scoring_actions_politician_id ON scoring_actions(politician_id);
CREATE INDEX idx_scoring_actions_action_date ON scoring_actions(action_date);
CREATE INDEX idx_scoring_actions_category ON scoring_actions(category);
CREATE INDEX idx_scoring_actions_verification_status ON scoring_actions(verification_status);

-- Add audit triggers
CREATE TRIGGER update_politician_scores_timestamp
BEFORE UPDATE ON politician_scores
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_score_components_timestamp
BEFORE UPDATE ON score_components
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scoring_actions_timestamp
BEFORE UPDATE ON scoring_actions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create view for politician score summary
CREATE OR REPLACE VIEW politician_score_summary AS
SELECT 
    p.id,
    p.name,
    p.party,
    p.state,
    p.position,
    ps.total_score,
    ps.public_statements_score,
    ps.legislative_action_score,
    ps.public_engagement_score,
    ps.social_media_score,
    ps.consistency_score,
    ps.days_of_silence,
    ps.last_activity_date,
    ps.last_calculated,
    CASE
        WHEN ps.total_score >= 80 THEN 'WHISTLEBLOWER'
        WHEN ps.total_score >= 50 THEN 'UNDER SURVEILLANCE'
        ELSE 'PERSON OF INTEREST'
    END AS status,
    COUNT(sa.id) AS total_actions
FROM 
    politicians p
LEFT JOIN 
    politician_scores ps ON p.id = ps.politician_id
LEFT JOIN 
    scoring_actions sa ON p.id = sa.politician_id
GROUP BY 
    p.id, p.name, p.party, p.state, p.position, 
    ps.total_score, ps.public_statements_score, ps.legislative_action_score, 
    ps.public_engagement_score, ps.social_media_score, ps.consistency_score,
    ps.days_of_silence, ps.last_activity_date, ps.last_calculated;

-- Create view for top scoring politicians
CREATE OR REPLACE VIEW top_scoring_politicians AS
SELECT 
    p.id,
    p.name,
    p.party,
    p.state,
    p.position,
    p.photo_url,
    ps.total_score,
    ps.days_of_silence,
    CASE
        WHEN ps.total_score >= 80 THEN 'WHISTLEBLOWER'
        WHEN ps.total_score >= 50 THEN 'UNDER SURVEILLANCE'
        ELSE 'PERSON OF INTEREST'
    END AS status
FROM 
    politicians p
JOIN 
    politician_scores ps ON p.id = ps.politician_id
ORDER BY 
    ps.total_score DESC, ps.days_of_silence ASC
LIMIT 10;

-- Create view for bottom scoring politicians
CREATE OR REPLACE VIEW bottom_scoring_politicians AS
SELECT 
    p.id,
    p.name,
    p.party,
    p.state,
    p.position,
    p.photo_url,
    ps.total_score,
    ps.days_of_silence,
    CASE
        WHEN ps.total_score >= 80 THEN 'WHISTLEBLOWER'
        WHEN ps.total_score >= 50 THEN 'UNDER SURVEILLANCE'
        ELSE 'PERSON OF INTEREST'
    END AS status
FROM 
    politicians p
JOIN 
    politician_scores ps ON p.id = ps.politician_id
ORDER BY 
    ps.total_score ASC, ps.days_of_silence DESC
LIMIT 10;

-- Create view for recent scoring actions
CREATE OR REPLACE VIEW recent_scoring_actions AS
SELECT 
    sa.id,
    sa.politician_id,
    p.name AS politician_name,
    p.party,
    p.state,
    sa.action_type,
    sa.action_date,
    sa.description,
    sa.points,
    sa.category,
    sa.sub_category,
    sa.verification_status,
    sa.source_url
FROM 
    scoring_actions sa
JOIN 
    politicians p ON sa.politician_id = p.id
WHERE 
    sa.verification_status = 'verified'
ORDER BY 
    sa.action_date DESC, sa.created_at DESC
LIMIT 20;
