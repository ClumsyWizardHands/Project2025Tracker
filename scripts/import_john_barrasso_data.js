/**
 * Import John Barrasso data into the database
 * 
 * This script imports John Barrasso's assessment data into the database,
 * including his scores, categories, and statements.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// John Barrasso data
const johnBarrassoData = {
  "representative": "John Barrasso",
  "state": "Wyoming",
  "party": "Republican",
  "position": "U.S. Senator",
  "numericalScore": 19,
  "totalPossible": 100,
  "categories": {
    "publicStatementsAndAdvocacy": {
      "score": 4,
      "maxPoints": 30,
      "actions": "Senator Barrasso has publicly criticized President Biden's energy policies, advocating for increased fossil fuel production.",
      "assessment": "His statements align with policies that support authoritarian acceleration, lacking strategic resistance."
    },
    "legislativeActionAndOversight": {
      "score": 3,
      "maxPoints": 25,
      "actions": "Co-introduced the Energy Permitting Reform Act of 2024 with Senator Joe Manchin, aiming to expedite fossil fuel projects.",
      "assessment": "Legislative efforts facilitate authoritarian-aligned policies, with no evidence of procedural obstruction."
    },
    "publicAndCommunityEngagement": {
      "score": 5,
      "maxPoints": 20,
      "actions": "Engaged with constituents through events and social media, including visits to schools and community gatherings.",
      "assessment": "Engagements are standard and lack adversarial or high-risk elements opposing authoritarian policies."
    },
    "socialMediaAndDigitalOutreach": {
      "score": 4,
      "maxPoints": 15,
      "actions": "Active on social media, promoting policies aligned with Project 2025 and criticizing opposing viewpoints.",
      "assessment": "Digital outreach supports authoritarian-aligned narratives without mobilizing resistance."
    },
    "consistencyAndDeepImpact": {
      "score": 3,
      "maxPoints": 10,
      "actions": "Consistently supports policies that align with authoritarian acceleration, including energy and environmental deregulation.",
      "assessment": "Demonstrates long-term alignment with authoritarian-enabling policies."
    }
  },
  "strategicIntegritySummary": "Senator John Barrasso's actions and statements consistently support policies that align with authoritarian acceleration, particularly in the energy sector. His legislative initiatives and public advocacy lack elements of resistance and instead facilitate the advancement of Project 2025 objectives.",
  "finalAccountabilityTag": "Complicit Enabler",
  "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
};

// John Barrasso statements
const johnBarrassoStatements = [
  {
    content: "We need to streamline the permitting process for energy projects across America. This bipartisan legislation will cut red tape and accelerate the development of American energy.",
    date: "2025-03-05",
    source_url: "https://example.com/barrasso-statement-1",
    source_name: "Senate Floor Speech",
    context: "Senator Barrasso made this statement while introducing the Energy Permitting Reform Act of 2024.",
    is_verified: true,
    tags: ["energy policy", "deregulation", "senate speech"]
  },
  {
    content: "President Biden's energy policies are hurting American families. We need to increase domestic oil and gas production to lower costs and ensure our energy independence.",
    date: "2025-02-15",
    source_url: "https://example.com/barrasso-statement-2",
    source_name: "Press Conference",
    context: "Senator Barrasso delivered this statement during a press conference on energy policy.",
    is_verified: true,
    tags: ["energy policy", "fossil fuels", "press conference"]
  },
  {
    content: "The EPA's new regulations are an overreach that will destroy jobs and raise energy costs for hardworking Americans. We must push back against this administrative state power grab.",
    date: "2025-01-20",
    source_url: "https://example.com/barrasso-statement-3",
    source_name: "Committee Hearing",
    context: "Senator Barrasso made this statement during an Environment and Public Works Committee hearing.",
    is_verified: true,
    tags: ["EPA", "regulations", "committee hearing"]
  }
];

// John Barrasso scoring actions
const johnBarrassoScoringActions = [
  {
    action_type: "legislative",
    description: "Co-introduced the Energy Permitting Reform Act of 2024 with Senator Joe Manchin, aiming to expedite fossil fuel projects.",
    date: "2025-03-05",
    impact_level: "high",
    strategic_value: "low",
    performance_modifier: 0.8,
    category: "legislativeActionAndOversight"
  },
  {
    action_type: "public_statement",
    description: "Criticized Biden administration's climate policies during a press conference, advocating for increased fossil fuel production.",
    date: "2025-02-15",
    impact_level: "medium",
    strategic_value: "low",
    performance_modifier: 0.7,
    category: "publicStatementsAndAdvocacy"
  },
  {
    action_type: "community_engagement",
    description: "Held town halls in Wyoming focused on energy policy and economic development.",
    date: "2025-01-10",
    impact_level: "medium",
    strategic_value: "low",
    performance_modifier: 0.8,
    category: "publicAndCommunityEngagement"
  },
  {
    action_type: "social_media",
    description: "Posted series of tweets supporting Project 2025 energy policies and criticizing renewable energy initiatives.",
    date: "2025-02-01",
    impact_level: "low",
    strategic_value: "low",
    performance_modifier: 0.9,
    category: "socialMediaAndDigitalOutreach"
  },
  {
    action_type: "oversight",
    description: "Questioned EPA administrator during committee hearing, challenging climate regulations.",
    date: "2025-01-20",
    impact_level: "medium",
    strategic_value: "low",
    performance_modifier: 0.7,
    category: "legislativeActionAndOversight"
  }
];

/**
 * Import John Barrasso data into the database
 */
async function importJohnBarrassoData() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Importing John Barrasso data...');
    
    // Insert politician
    const politicianResult = await client.query(
      `INSERT INTO politicians (
        name, party, state, position, photo_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW()
      ) RETURNING id`,
      [
        johnBarrassoData.representative,
        johnBarrassoData.party,
        johnBarrassoData.state,
        johnBarrassoData.position,
        'https://upload.wikimedia.org/wikipedia/commons/4/4d/John_Barrasso_official_portrait_112th_Congress.jpg',
      ]
    );
    
    const politicianId = politicianResult.rows[0].id;
    console.log(`Politician inserted with ID: ${politicianId}`);
    
    // Insert politician score
    await client.query(
      `INSERT INTO politician_scores (
        politician_id, score, max_score, resistance_level, strategic_integrity_summary,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW()
      )`,
      [
        politicianId,
        johnBarrassoData.numericalScore,
        johnBarrassoData.totalPossible,
        johnBarrassoData.finalAccountabilityTag,
        johnBarrassoData.strategicIntegritySummary
      ]
    );
    
    console.log('Politician score inserted');
    
    // Insert score components
    for (const [category, data] of Object.entries(johnBarrassoData.categories)) {
      await client.query(
        `INSERT INTO score_components (
          politician_id, category, score, max_points, actions, assessment,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )`,
        [
          politicianId,
          category,
          data.score,
          data.maxPoints,
          data.actions,
          data.assessment
        ]
      );
    }
    
    console.log('Score components inserted');
    
    // Insert statements
    for (const statement of johnBarrassoStatements) {
      const statementResult = await client.query(
        `INSERT INTO statements (
          politician_id, content, date, source_url, source_name, context, is_verified,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        ) RETURNING id`,
        [
          politicianId,
          statement.content,
          statement.date,
          statement.source_url,
          statement.source_name,
          statement.context,
          statement.is_verified
        ]
      );
      
      const statementId = statementResult.rows[0].id;
      
      // Insert tags for the statement
      for (const tagName of statement.tags) {
        // Check if tag exists
        const tagResult = await client.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        let tagId;
        
        if (tagResult.rows.length > 0) {
          tagId = tagResult.rows[0].id;
        } else {
          // Create new tag
          const newTagResult = await client.query(
            'INSERT INTO tags (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
            [tagName]
          );
          
          tagId = newTagResult.rows[0].id;
        }
        
        // Create statement_tag relationship
        await client.query(
          'INSERT INTO statement_tags (statement_id, tag_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          [statementId, tagId]
        );
      }
    }
    
    console.log('Statements and tags inserted');
    
    // Insert scoring actions
    for (const action of johnBarrassoScoringActions) {
      await client.query(
        `INSERT INTO scoring_actions (
          politician_id, action_type, description, date, impact_level, strategic_value,
          performance_modifier, category, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )`,
        [
          politicianId,
          action.action_type,
          action.description,
          action.date,
          action.impact_level,
          action.strategic_value,
          action.performance_modifier,
          action.category
        ]
      );
    }
    
    console.log('Scoring actions inserted');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('John Barrasso data imported successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error importing John Barrasso data:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

// Run the import function
importJohnBarrassoData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
