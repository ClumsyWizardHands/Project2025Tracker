-- Database: project2025tracker

CREATE DATABASE project2025tracker
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c project2025tracker;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create politicians table
CREATE TABLE politicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    party VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(255),
    website_url VARCHAR(255),
    twitter_handle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create statements table
CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    source_url VARCHAR(255) NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    context TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scores table
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
    category VARCHAR(50) NOT NULL,
    methodology TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table for categorizing statements
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create statement_tags junction table
CREATE TABLE statement_tags (
    statement_id UUID NOT NULL REFERENCES statements(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (statement_id, tag_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_politicians_party ON politicians(party);
CREATE INDEX idx_politicians_state ON politicians(state);
CREATE INDEX idx_statements_politician_id ON statements(politician_id);
CREATE INDEX idx_statements_date ON statements(date);
CREATE INDEX idx_scores_politician_id ON scores(politician_id);
CREATE INDEX idx_scores_category ON scores(category);
CREATE INDEX idx_statement_tags_statement_id ON statement_tags(statement_id);
CREATE INDEX idx_statement_tags_tag_id ON statement_tags(tag_id);

-- Create view for politician summary
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

-- Add audit triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_politicians_timestamp
BEFORE UPDATE ON politicians
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_statements_timestamp
BEFORE UPDATE ON statements
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scores_timestamp
BEFORE UPDATE ON scores
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tags_timestamp
BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
