
-- Insert politician: Tammy Baldwin
INSERT INTO "Politicians" (
  "external_id", 
  "name", 
  "party", 
  "state", 
  "district", 
  "chamber"
) VALUES (
  'B001230',
  'Tammy Baldwin',
  'D',
  'WI',
  NULL,
  'Senate'
) ON CONFLICT ("external_id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "party" = EXCLUDED."party",
  "state" = EXCLUDED."state",
  "district" = EXCLUDED."district",
  "chamber" = EXCLUDED."chamber";


-- Insert score for: Tammy Baldwin
INSERT INTO "PoliticianScores" (
  "politician_id",
  "total_score",
  "public_statements_score",
  "legislative_action_score",
  "public_engagement_score",
  "social_media_score",
  "consistency_score",
  "data_status",
  "last_updated"
) VALUES (
  (SELECT "id" FROM "Politicians" WHERE "external_id" = 'B001230'),
  45,
  0,
  0,
  20,
  15,
  10,
  'Sufficient',
  CURRENT_TIMESTAMP
) ON CONFLICT ("politician_id") DO UPDATE SET
  "total_score" = EXCLUDED."total_score",
  "public_statements_score" = EXCLUDED."public_statements_score",
  "legislative_action_score" = EXCLUDED."legislative_action_score",
  "public_engagement_score" = EXCLUDED."public_engagement_score",
  "social_media_score" = EXCLUDED."social_media_score",
  "consistency_score" = EXCLUDED."consistency_score",
  "data_status" = EXCLUDED."data_status",
  "last_updated" = EXCLUDED."last_updated";


-- Insert politician: James Edward Banks
INSERT INTO "Politicians" (
  "external_id", 
  "name", 
  "party", 
  "state", 
  "district", 
  "chamber"
) VALUES (
  'B001299',
  'James Edward Banks',
  'R',
  'IN',
  NULL,
  'Senate'
) ON CONFLICT ("external_id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "party" = EXCLUDED."party",
  "state" = EXCLUDED."state",
  "district" = EXCLUDED."district",
  "chamber" = EXCLUDED."chamber";


-- Insert score for: James Edward Banks
INSERT INTO "PoliticianScores" (
  "politician_id",
  "total_score",
  "public_statements_score",
  "legislative_action_score",
  "public_engagement_score",
  "social_media_score",
  "consistency_score",
  "data_status",
  "last_updated"
) VALUES (
  (SELECT "id" FROM "Politicians" WHERE "external_id" = 'B001299'),
  0,
  0,
  0,
  0,
  0,
  0,
  'Insufficient Data',
  CURRENT_TIMESTAMP
) ON CONFLICT ("politician_id") DO UPDATE SET
  "total_score" = EXCLUDED."total_score",
  "public_statements_score" = EXCLUDED."public_statements_score",
  "legislative_action_score" = EXCLUDED."legislative_action_score",
  "public_engagement_score" = EXCLUDED."public_engagement_score",
  "social_media_score" = EXCLUDED."social_media_score",
  "consistency_score" = EXCLUDED."consistency_score",
  "data_status" = EXCLUDED."data_status",
  "last_updated" = EXCLUDED."last_updated";


-- Insert politician: John Anthony Barrasso III
INSERT INTO "Politicians" (
  "external_id", 
  "name", 
  "party", 
  "state", 
  "district", 
  "chamber"
) VALUES (
  'B001261',
  'John Anthony Barrasso III',
  'R',
  'WY',
  NULL,
  'Senate'
) ON CONFLICT ("external_id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "party" = EXCLUDED."party",
  "state" = EXCLUDED."state",
  "district" = EXCLUDED."district",
  "chamber" = EXCLUDED."chamber";


-- Insert score for: John Anthony Barrasso III
INSERT INTO "PoliticianScores" (
  "politician_id",
  "total_score",
  "public_statements_score",
  "legislative_action_score",
  "public_engagement_score",
  "social_media_score",
  "consistency_score",
  "data_status",
  "last_updated"
) VALUES (
  (SELECT "id" FROM "Politicians" WHERE "external_id" = 'B001261'),
  37,
  0,
  13,
  6,
  8,
  10,
  'Sufficient',
  CURRENT_TIMESTAMP
) ON CONFLICT ("politician_id") DO UPDATE SET
  "total_score" = EXCLUDED."total_score",
  "public_statements_score" = EXCLUDED."public_statements_score",
  "legislative_action_score" = EXCLUDED."legislative_action_score",
  "public_engagement_score" = EXCLUDED."public_engagement_score",
  "social_media_score" = EXCLUDED."social_media_score",
  "consistency_score" = EXCLUDED."consistency_score",
  "data_status" = EXCLUDED."data_status",
  "last_updated" = EXCLUDED."last_updated";
