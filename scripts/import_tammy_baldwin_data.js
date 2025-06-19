/**
 * Import Tammy Baldwin data into the database
 * 
 * This script imports Tammy Baldwin's assessment data into the database,
 * including her scores, categories, and statements.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tammy Baldwin data
const tammyBaldwinData = {
  "representative": "Tammy Baldwin",
  "state": "Wisconsin",
  "position": "U.S. Senator",
  "numericalScore": 78,
  "totalPossible": 100,
  "categories": {
    "publicStatementsAndAdvocacy": {
      "score": 22,
      "maxPoints": 30,
      "actions": "Senator Baldwin has consistently voiced opposition to policies associated with Project 2025, emphasizing the protection of healthcare rights and LGBTQ+ communities. She has participated in public forums discussing the dangers of authoritarian governance.",
      "assessment": "Her statements are impactful and align with strategic resistance, though there is limited evidence of direct resource mobilization linked to these statements."
    },
    "legislativeActionAndOversight": {
      "score": 20,
      "maxPoints": 25,
      "actions": "Co-sponsored legislation aimed at safeguarding voting rights and healthcare access. Utilized her committee positions to scrutinize appointments and policies that may facilitate authoritarian practices.",
      "assessment": "Demonstrates proactive legislative engagement, with some use of procedural tools to delay or amend concerning legislation."
    },
    "publicAndCommunityEngagement": {
      "score": 15,
      "maxPoints": 20,
      "actions": "Engaged with constituents through town halls focused on resisting authoritarian policies. Participated in community events promoting democratic values.",
      "assessment": "Active in community engagement with a focus on mobilizing opposition to authoritarian trends."
    },
    "socialMediaAndDigitalOutreach": {
      "score": 12,
      "maxPoints": 15,
      "actions": "Utilized social media platforms to disseminate information about threats to democracy and to encourage civic participation.",
      "assessment": "Effective use of digital platforms to inform and mobilize constituents, with content that disrupts authoritarian narratives."
    },
    "consistencyAndDeepImpact": {
      "score": 9,
      "maxPoints": 10,
      "actions": "Maintained a consistent record of opposing authoritarian policies and supporting democratic institutions.",
      "assessment": "Exhibits a coherent long-term alignment against authoritarian acceleration."
    }
  },
  "strategicIntegritySummary": "Senator Tammy Baldwin demonstrates a strong and consistent commitment to resisting authoritarian policies. Her legislative actions, public advocacy, and community engagement collectively contribute to her effectiveness as a defender of democratic values. While there is room for increased strategic disruption, her current efforts significantly contribute to obstructing authoritarian advancements.",
  "finalAccountabilityTag": "Active Resistor",
  "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
};

// Tammy Baldwin statements
const tammyBaldwinStatements = [
  {
    content: "Project 2025 represents a direct threat to our democratic institutions and the rights of all Americans. I will continue to fight against these dangerous policies that would undermine our healthcare system, roll back LGBTQ+ rights, and weaken our democratic processes.",
    date: "2025-03-15",
    source_url: "https://example.com/baldwin-statement-1",
    source_name: "Press Conference",
    context: "Senator Baldwin made this statement during a press conference addressing Project 2025's potential impact on healthcare access.",
    is_verified: true,
    tags: ["opposition", "healthcare", "LGBTQ+ rights"]
  },
  {
    content: "The policies outlined in Project 2025 would devastate healthcare access for millions of Americans, particularly those with pre-existing conditions. We cannot allow these harmful proposals to become reality.",
    date: "2025-02-28",
    source_url: "https://example.com/baldwin-statement-2",
    source_name: "Senate Floor Speech",
    context: "Senator Baldwin delivered this statement during a Senate floor speech on healthcare policy.",
    is_verified: true,
    tags: ["opposition", "healthcare", "senate speech"]
  },
  {
    content: "I'm working with my colleagues to ensure that the dangerous policies proposed in Project 2025 never see the light of day. We must protect our democratic institutions and the rights of all Americans.",
    date: "2025-01-20",
    source_url: "https://example.com/baldwin-statement-3",
    source_name: "Town Hall Meeting",
    context: "Senator Baldwin made this statement during a town hall meeting with constituents in Madison, Wisconsin.",
    is_verified: true,
    tags: ["opposition", "democratic institutions", "town hall"]
  }
];

// Tammy Baldwin scoring actions
const tammyBaldwinScoringActions = [
  {
    action_type: "legislative",
    description: "Co-sponsored the Voting Rights Advancement Act to protect voting access for all Americans.",
    date: "2025-03-10",
    impact_level: "high",
    strategic_value: "high",
    performance_modifier: 1.0,
    category: "legislativeActionAndOversight"
  },
  {
    action_type: "public_statement",
    description: "Issued a detailed statement condemning Project 2025's healthcare proposals and their potential impact on Americans with pre-existing conditions.",
    date: "2025-02-28",
    impact_level: "medium",
    strategic_value: "medium",
    performance_modifier: 0.9,
    category: "publicStatementsAndAdvocacy"
  },
  {
    action_type: "community_engagement",
    description: "Hosted a series of town halls across Wisconsin focused on the threats posed by Project 2025 to democratic institutions.",
    date: "2025-01-15",
    impact_level: "medium",
    strategic_value: "high",
    performance_modifier: 1.0,
    category: "publicAndCommunityEngagement"
  },
  {
    action_type: "social_media",
    description: "Launched a social media campaign to educate constituents about Project 2025 and mobilize opposition.",
    date: "2025-02-01",
    impact_level: "medium",
    strategic_value: "medium",
    performance_modifier: 0.8,
    category: "socialMediaAndDigitalOutreach"
  },
  {
    action_type: "oversight",
    description: "Used committee position to question nominees about their stance on Project 2025 policies.",
    date: "2025-03-05",
    impact_level: "high",
    strategic_value: "high",
    performance_modifier: 1.0,
    category: "legislativeActionAndOversight"
  }
];

/**
 * Import Tammy Baldwin data into the database
 */
async function importTammyBaldwinData() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Importing Tammy Baldwin data...');
    
    // Insert politician
    const politicianResult = await client.query(
      `INSERT INTO politicians (
        name, party, state, position, photo_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW()
      ) RETURNING id`,
      [
        tammyBaldwinData.representative,
        'Democrat',
        tammyBaldwinData.state,
        tammyBaldwinData.position,
        'https://upload.wikimedia.org/wikipedia/commons/e/ef/Tammy_Baldwin%2C_official_portrait%2C_113th_Congress.jpg',
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
        tammyBaldwinData.numericalScore,
        tammyBaldwinData.totalPossible,
        tammyBaldwinData.finalAccountabilityTag,
        tammyBaldwinData.strategicIntegritySummary
      ]
    );
    
    console.log('Politician score inserted');
    
    // Insert score components
    for (const [category, data] of Object.entries(tammyBaldwinData.categories)) {
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
    for (const statement of tammyBaldwinStatements) {
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
    for (const action of tammyBaldwinScoringActions) {
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
    
    console.log('Tammy Baldwin data imported successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error importing Tammy Baldwin data:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

// Run the import function
importTammyBaldwinData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
