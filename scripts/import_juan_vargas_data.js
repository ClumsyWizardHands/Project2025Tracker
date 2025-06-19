/**
 * Import Juan Vargas Data
 * 
 * This script imports Juan Vargas data into the database using the enhanced scoring system.
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'project2025tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Juan Vargas data
const juanVargasData = {
  "representative": "Juan Vargas",
  "district": "CA-52",
  "numericalScore": 71,
  "totalPossible": 100,
  "categories": {
    "publicStatementsAndAdvocacy": {
      "score": 18,
      "maxPoints": 30,
      "actions": "Rep. Vargas has publicly criticized Project 2025, labeling it as detrimental to essential programs like Medicaid and SNA. He has also voted against Republican budget plans that he perceives as harmful to social program.",
      "assessment": "While his statements are clear and oppositional to authoritarian-leaning policies, they are primarily rhetorical without accompanying strategic actions or resource mobilization."
    },
    "legislativeActionAndOversight": {
      "score": 16,
      "maxPoints": 25,
      "actions": "Co-sponsored the American Dream and Promise Act of 2025, aiming to provide a pathway to citizenship for Dreamers and other immigrants. Introduced legislation to update federal credit union board meeting requirements.",
      "assessment": "Demonstrates legislative engagement on social justice issues. However, lacks evidence of using committee power or procedural tools to obstruct authoritarian policies."
    },
    "publicAndCommunityEngagement": {
      "score": 12,
      "maxPoints": 20,
      "actions": "Advocated for community projects, such as flood mitigation in San Diego's Southcrest community. Engaged with constituents through recognition of community advocates.",
      "assessment": "Active in community engagement, but lacks evidence of high-risk or adversarial appearances opposing authoritarian policies."
    },
    "socialMediaAndDigitalOutreach": {
      "score": 10,
      "maxPoints": 15,
      "actions": "Utilized platforms like Facebook and X to criticize Project 2025 and related policies.",
      "assessment": "Effective in using social media to inform and mobilize constituents against authoritarian-leaning policies."
    },
    "consistencyAndDeepImpact": {
      "score": 10,
      "maxPoints": 10,
      "actions": "Consistently opposed policies perceived as authoritarian. Maintained a steady record of supporting social justice and immigrant rights.",
      "assessment": "Demonstrates a coherent long-term alignment against authoritarian acceleration."
    }
  },
  "strategicIntegritySummary": "Rep. Juan Vargas exhibits a consistent oppositional stance against authoritarian-leaning policies, particularly those associated with Project 2025. His legislative efforts and public statements align with pro-democracy values. However, there is a lack of evidence showing the use of strategic legislative tools or high-risk public engagements to actively disrupt authoritarian advancements.",
  "finalAccountabilityTag": "Active Resistor",
  "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
};

/**
 * Import Juan Vargas data into the database
 */
async function importJuanVargasData() {
  console.log('Importing Juan Vargas data...');
  
  // Connect to database
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if politician already exists
    const checkPoliticianQuery = 'SELECT id FROM politicians WHERE name = $1';
    const checkPoliticianResult = await client.query(checkPoliticianQuery, [juanVargasData.representative]);
    
    let politicianId;
    
    if (checkPoliticianResult.rows.length > 0) {
      // Politician exists, use existing ID
      politicianId = checkPoliticianResult.rows[0].id;
      console.log(`Politician ${juanVargasData.representative} already exists with ID: ${politicianId}`);
    } else {
      // Create new politician
      politicianId = uuidv4();
      const insertPoliticianQuery = `
        INSERT INTO politicians (
          id, name, party, state, position, photo_url, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
      `;
      
      await client.query(insertPoliticianQuery, [
        politicianId,
        juanVargasData.representative,
        'Democratic', // Assuming Democratic party
        'CA', // From CA-52
        'Representative', // Position
        'https://vargas.house.gov/sites/evo-subsites/vargas.house.gov/files/evo-media-image/Official%20Photo%20-%20Rep.%20Juan%20Vargas.jpg', // Official photo URL
      ]);
      
      console.log(`Created new politician: ${juanVargasData.representative} with ID: ${politicianId}`);
    }
    
    // Add committee memberships
    // Note: This is placeholder data, replace with actual committee memberships
    const committees = [
      {
        committee_name: 'House Financial Services Committee',
        leadership_position: 'Member'
      },
      {
        committee_name: 'House Foreign Affairs Committee',
        leadership_position: 'Member'
      }
    ];
    
    for (const committee of committees) {
      const insertCommitteeQuery = `
        INSERT INTO politician_committees (
          id, politician_id, committee_name, leadership_position, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, NOW(), NOW()
        ) ON CONFLICT (politician_id, committee_name) DO NOTHING
      `;
      
      await client.query(insertCommitteeQuery, [
        uuidv4(),
        politicianId,
        committee.committee_name,
        committee.leadership_position
      ]);
      
      console.log(`Added committee: ${committee.committee_name}`);
    }
    
    // Create or update politician score
    const checkScoreQuery = 'SELECT id FROM politician_scores WHERE politician_id = $1';
    const checkScoreResult = await client.query(checkScoreQuery, [politicianId]);
    
    const scoreId = checkScoreResult.rows.length > 0 ? checkScoreResult.rows[0].id : uuidv4();
    
    // Map category scores to our database structure
    const publicStatementsScore = juanVargasData.categories.publicStatementsAndAdvocacy.score / juanVargasData.categories.publicStatementsAndAdvocacy.maxPoints * 100;
    const legislativeActionScore = juanVargasData.categories.legislativeActionAndOversight.score / juanVargasData.categories.legislativeActionAndOversight.maxPoints * 100;
    const publicEngagementScore = juanVargasData.categories.publicAndCommunityEngagement.score / juanVargasData.categories.publicAndCommunityEngagement.maxPoints * 100;
    const socialMediaScore = juanVargasData.categories.socialMediaAndDigitalOutreach.score / juanVargasData.categories.socialMediaAndDigitalOutreach.maxPoints * 100;
    const consistencyScore = juanVargasData.categories.consistencyAndDeepImpact.score / juanVargasData.categories.consistencyAndDeepImpact.maxPoints * 100;
    
    // Calculate enhanced metrics
    const strategicIntegrityScore = 70; // Based on the strategic integrity summary
    const infrastructureUnderstandingScore = 60; // Based on legislative action assessment
    const performanceVsImpactScore = 65; // Based on overall assessment
    
    if (checkScoreResult.rows.length > 0) {
      // Update existing score
      const updateScoreQuery = `
        UPDATE politician_scores SET
          total_score = $1,
          public_statements_score = $2,
          legislative_action_score = $3,
          public_engagement_score = $4,
          social_media_score = $5,
          consistency_score = $6,
          strategic_integrity_score = $7,
          infrastructure_understanding_score = $8,
          performance_vs_impact_score = $9,
          resistance_level = $10,
          days_of_silence = $11,
          last_activity_date = $12,
          last_calculated = NOW(),
          updated_at = NOW()
        WHERE id = $13
      `;
      
      await client.query(updateScoreQuery, [
        juanVargasData.numericalScore,
        Math.round(publicStatementsScore),
        Math.round(legislativeActionScore),
        Math.round(publicEngagementScore),
        Math.round(socialMediaScore),
        Math.round(consistencyScore),
        strategicIntegrityScore,
        infrastructureUnderstandingScore,
        performanceVsImpactScore,
        juanVargasData.finalAccountabilityTag,
        0, // Days of silence (assuming active)
        new Date(), // Last activity date (today)
        scoreId
      ]);
      
      console.log(`Updated politician score for ${juanVargasData.representative}`);
    } else {
      // Create new score
      const insertScoreQuery = `
        INSERT INTO politician_scores (
          id, politician_id, total_score, public_statements_score, legislative_action_score,
          public_engagement_score, social_media_score, consistency_score,
          strategic_integrity_score, infrastructure_understanding_score, performance_vs_impact_score,
          resistance_level, days_of_silence, last_activity_date, last_calculated,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW(), NOW()
        )
      `;
      
      await client.query(insertScoreQuery, [
        scoreId,
        politicianId,
        juanVargasData.numericalScore,
        Math.round(publicStatementsScore),
        Math.round(legislativeActionScore),
        Math.round(publicEngagementScore),
        Math.round(socialMediaScore),
        Math.round(consistencyScore),
        strategicIntegrityScore,
        infrastructureUnderstandingScore,
        performanceVsImpactScore,
        juanVargasData.finalAccountabilityTag,
        0, // Days of silence (assuming active)
        new Date() // Last activity date (today)
      ]);
      
      console.log(`Created new politician score for ${juanVargasData.representative}`);
    }
    
    // Add scoring actions
    const categories = {
      'publicStatementsAndAdvocacy': 'public_statements',
      'legislativeActionAndOversight': 'legislative_action',
      'publicAndCommunityEngagement': 'public_engagement',
      'socialMediaAndDigitalOutreach': 'social_media',
      'consistencyAndDeepImpact': 'consistency'
    };
    
    for (const [categoryKey, categoryData] of Object.entries(juanVargasData.categories)) {
      const category = categories[categoryKey];
      
      // Create scoring action
      const actionId = uuidv4();
      const insertActionQuery = `
        INSERT INTO scoring_actions (
          id, politician_id, action_type, action_date, description, points, category,
          verification_status, verified_at, time_value, strategic_value, has_action_follow_up,
          impact_level, risk_level, strategic_function, performance_modifier, contradiction_flag,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
        )
      `;
      
      // Determine strategic value, impact level, etc. based on assessment
      let strategicValue = 'Medium';
      let hasActionFollowUp = false;
      let impactLevel = 'Medium';
      let riskLevel = 'Low';
      let strategicFunction = 'Inform';
      let performanceModifier = 1.0;
      
      if (categoryKey === 'publicStatementsAndAdvocacy') {
        strategicValue = 'Medium';
        hasActionFollowUp = false;
        impactLevel = 'Medium';
        strategicFunction = 'Inform';
        performanceModifier = 0.8;
      } else if (categoryKey === 'legislativeActionAndOversight') {
        strategicValue = 'Medium';
        hasActionFollowUp = true;
        impactLevel = 'Medium';
        strategicFunction = 'Disrupt';
        performanceModifier = 1.0;
      } else if (categoryKey === 'publicAndCommunityEngagement') {
        strategicValue = 'Medium';
        hasActionFollowUp = true;
        impactLevel = 'Medium';
        riskLevel = 'Low';
        strategicFunction = 'Mobilize';
        performanceModifier = 0.9;
      } else if (categoryKey === 'socialMediaAndDigitalOutreach') {
        strategicValue = 'Medium';
        hasActionFollowUp = false;
        impactLevel = 'Low';
        strategicFunction = 'Inform';
        performanceModifier = 0.7;
      } else if (categoryKey === 'consistencyAndDeepImpact') {
        strategicValue = 'High';
        hasActionFollowUp = true;
        impactLevel = 'High';
        strategicFunction = 'Disrupt';
        performanceModifier = 1.0;
      }
      
      await client.query(insertActionQuery, [
        actionId,
        politicianId,
        category === 'public_statements' ? 'statement' : 
        category === 'legislative_action' ? 'vote' :
        category === 'public_engagement' ? 'public_event' :
        category === 'social_media' ? 'social_post' : 'other',
        new Date(), // Action date (today)
        categoryData.actions,
        categoryData.score,
        category,
        'verified', // Verification status
        new Date(), // Verified at (today)
        1.0, // Time value (100% for recent actions)
        strategicValue,
        hasActionFollowUp,
        impactLevel,
        riskLevel,
        strategicFunction,
        performanceModifier,
        false // Contradiction flag
      ]);
      
      console.log(`Added scoring action for category: ${category}`);
      
      // Add evidence source
      const evidenceId = uuidv4();
      const insertEvidenceQuery = `
        INSERT INTO evidence_sources (
          id, scoring_action_id, source_url, source_type, confidence_rating,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, NOW(), NOW()
        )
      `;
      
      await client.query(insertEvidenceQuery, [
        evidenceId,
        actionId,
        'https://project2025tracker.org/evidence/' + actionId, // Placeholder URL
        'official_record', // Source type
        8 // Confidence rating (1-10)
      ]);
      
      console.log(`Added evidence source for action: ${actionId}`);
    }
    
    // Add score history entry
    const historyId = uuidv4();
    const insertHistoryQuery = `
      INSERT INTO score_history (
        id, politician_id, total_score, public_statements_score, legislative_action_score,
        public_engagement_score, social_media_score, consistency_score,
        days_of_silence, recorded_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      )
    `;
    
    await client.query(insertHistoryQuery, [
      historyId,
      politicianId,
      juanVargasData.numericalScore,
      Math.round(publicStatementsScore),
      Math.round(legislativeActionScore),
      Math.round(publicEngagementScore),
      Math.round(socialMediaScore),
      Math.round(consistencyScore),
      0, // Days of silence
      new Date() // Recorded date (today)
    ]);
    
    console.log(`Added score history entry for ${juanVargasData.representative}`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`Successfully imported data for ${juanVargasData.representative}`);
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error importing Juan Vargas data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
importJuanVargasData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
