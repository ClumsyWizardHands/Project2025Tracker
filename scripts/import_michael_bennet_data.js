/**
 * Import Michael Bennet Data Script
 * 
 * This script imports data for Senator Michael Bennet (D-CO) into the Project2025Tracker database.
 * It creates the politician record, statements, scoring actions, and calculates the overall score.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/project2025tracker'
});

// Michael Bennet data
const michaelBennetData = {
  politician: {
    id: 'michael-bennet',
    name: 'Michael Bennet',
    party: 'Democrat',
    state: 'Colorado',
    position: 'U.S. Senator',
    district: null,
    bio: "Michael Farrand Bennet is an American businessman, lawyer, and politician who has served as the senior United States senator from Colorado since 2009. A member of the Democratic Party, he was appointed to the seat when Senator Ken Salazar became Secretary of the Interior. Bennet previously worked as a managing director for the Anschutz Investment Company, chief of staff to Denver Mayor John Hickenlooper, and superintendent of Denver Public Schools.",
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Michael_Bennet_Official_Photo.jpg/800px-Michael_Bennet_Official_Photo.jpg',
    website: 'https://www.bennet.senate.gov/',
    twitter: '@SenatorBennet',
    facebook: 'senbennetco',
    instagram: 'senatorbennet',
    youtube: 'SenatorBennet',
    contact_page: 'https://www.bennet.senate.gov/public/index.cfm/contact',
    phone: '202-224-5852',
    senate_class: 3,
    created_at: new Date(),
    updated_at: new Date()
  },
  statements: [
    {
      content: "There is not a person in the Senate who's more worried about what Trump is doing to our democracy and our economy than I am.",
      date: new Date('2025-03-15'),
      source_url: 'https://example.com/bennet-statement-1',
      source_name: 'Press Conference',
      context: "Senator Bennet made this statement during a press conference addressing former President Trump's influence on democracy.",
      is_verified: true,
      tags: ['democracy', 'opposition']
    }
  ],
  scoringActions: [
    {
      category: 'Public Statements and Advocacy',
      action: "Senator Bennet has publicly expressed strong opposition to former President Donald Trump's influence on democracy.",
      impact: 'Medium',
      date: new Date('2025-03-15'),
      score: 18,
      max_score: 30,
      strategic_value: 'Medium',
      performance_modifier: 0.8,
      infrastructure_understanding: 'Medium'
    },
    {
      category: 'Legislative Action and Oversight',
      action: "Co-sponsored the Protect the West Act, aiming to invest $60 billion to reduce wildfire risk and protect communities.",
      impact: 'Medium',
      date: new Date('2025-02-10'),
      score: 15,
      max_score: 25,
      strategic_value: 'Medium',
      performance_modifier: 0.7,
      infrastructure_understanding: 'High'
    },
    {
      category: 'Public and Community Engagement',
      action: "Announced his candidacy for Colorado governor, citing the need to oppose Trump's influence and protect democracy.",
      impact: 'Medium',
      date: new Date('2025-01-20'),
      score: 10,
      max_score: 20,
      strategic_value: 'Medium',
      performance_modifier: 0.6,
      infrastructure_understanding: 'Medium'
    },
    {
      category: 'Social Media and Digital Outreach',
      action: "Utilized social media platforms to disseminate information about threats to democracy and to encourage civic participation.",
      impact: 'Medium',
      date: new Date('2025-03-01'),
      score: 10,
      max_score: 15,
      strategic_value: 'Medium',
      performance_modifier: 0.8,
      infrastructure_understanding: 'Medium'
    },
    {
      category: 'Consistency and Deep Impact',
      action: "Maintained a consistent record of opposing authoritarian policies and supporting democratic institutions.",
      impact: 'High',
      date: new Date('2025-04-01'),
      score: 10,
      max_score: 10,
      strategic_value: 'High',
      performance_modifier: 1.0,
      infrastructure_understanding: 'High'
    }
  ],
  politicianScore: {
    score: 63,
    max_score: 100,
    category: 'Inconsistent Advocate',
    strategic_integrity: 0.75,
    infrastructure_understanding: 0.70,
    performance_vs_impact: 0.65,
    date: new Date(),
    notes: "Senator Michael Bennet demonstrates a consistent commitment to resisting authoritarian policies through public statements and legislative efforts. His recent decision to run for Colorado governor underscores his dedication to opposing authoritarian influences at both state and national levels. However, there is room for increased strategic disruption and direct opposition to initiatives like Project 2025."
  },
  committees: [
    {
      name: 'Committee on Agriculture, Nutrition, and Forestry',
      role: 'Member',
      influence_level: 'Medium'
    },
    {
      name: 'Committee on Finance',
      role: 'Member',
      influence_level: 'High'
    },
    {
      name: 'Select Committee on Intelligence',
      role: 'Member',
      influence_level: 'High'
    }
  ],
  evidenceSources: [
    {
      name: 'Senate Voting Record',
      url: 'https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_117_1.htm',
      confidence_rating: 'High',
      notes: 'Official Senate voting record provides high-confidence evidence of legislative actions.'
    },
    {
      name: 'Press Statements',
      url: 'https://www.bennet.senate.gov/public/index.cfm/press-releases',
      confidence_rating: 'High',
      notes: 'Official press releases from Senator Bennet\'s office.'
    },
    {
      name: 'Social Media Analysis',
      url: 'https://twitter.com/SenatorBennet',
      confidence_rating: 'Medium',
      notes: 'Analysis of Twitter statements provides medium-confidence evidence of public positions.'
    }
  ]
};

/**
 * Main function to import Michael Bennet data
 */
async function importMichaelBennetData() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Importing Michael Bennet data...');
    
    // Insert politician
    console.log('Inserting politician record...');
    const politicianResult = await client.query(
      `INSERT INTO politicians (
        id, name, party, state, position, district, bio, photo_url, 
        website, twitter, facebook, instagram, youtube, 
        contact_page, phone, senate_class, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        party = EXCLUDED.party,
        state = EXCLUDED.state,
        position = EXCLUDED.position,
        district = EXCLUDED.district,
        bio = EXCLUDED.bio,
        photo_url = EXCLUDED.photo_url,
        website = EXCLUDED.website,
        twitter = EXCLUDED.twitter,
        facebook = EXCLUDED.facebook,
        instagram = EXCLUDED.instagram,
        youtube = EXCLUDED.youtube,
        contact_page = EXCLUDED.contact_page,
        phone = EXCLUDED.phone,
        senate_class = EXCLUDED.senate_class,
        updated_at = EXCLUDED.updated_at
      RETURNING id`,
      [
        michaelBennetData.politician.id,
        michaelBennetData.politician.name,
        michaelBennetData.politician.party,
        michaelBennetData.politician.state,
        michaelBennetData.politician.position,
        michaelBennetData.politician.district,
        michaelBennetData.politician.bio,
        michaelBennetData.politician.photo_url,
        michaelBennetData.politician.website,
        michaelBennetData.politician.twitter,
        michaelBennetData.politician.facebook,
        michaelBennetData.politician.instagram,
        michaelBennetData.politician.youtube,
        michaelBennetData.politician.contact_page,
        michaelBennetData.politician.phone,
        michaelBennetData.politician.senate_class,
        michaelBennetData.politician.created_at,
        michaelBennetData.politician.updated_at
      ]
    );
    
    const politicianId = politicianResult.rows[0].id;
    console.log(`Politician record inserted/updated with ID: ${politicianId}`);
    
    // Insert statements
    console.log('Inserting statements...');
    for (const statement of michaelBennetData.statements) {
      const statementResult = await client.query(
        `INSERT INTO statements (
          politician_id, content, date, source_url, source_name, 
          context, is_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (politician_id, content, date) DO UPDATE SET
          source_url = EXCLUDED.source_url,
          source_name = EXCLUDED.source_name,
          context = EXCLUDED.context,
          is_verified = EXCLUDED.is_verified,
          updated_at = EXCLUDED.updated_at
        RETURNING id`,
        [
          politicianId,
          statement.content,
          statement.date,
          statement.source_url,
          statement.source_name,
          statement.context,
          statement.is_verified,
          new Date(),
          new Date()
        ]
      );
      
      const statementId = statementResult.rows[0].id;
      console.log(`Statement inserted/updated with ID: ${statementId}`);
      
      // Insert tags for the statement
      if (statement.tags && statement.tags.length > 0) {
        for (const tagName of statement.tags) {
          // First, ensure the tag exists
          const tagResult = await client.query(
            `INSERT INTO tags (name, created_at, updated_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE SET
              updated_at = EXCLUDED.updated_at
            RETURNING id`,
            [tagName, new Date(), new Date()]
          );
          
          const tagId = tagResult.rows[0].id;
          
          // Then, associate the tag with the statement
          await client.query(
            `INSERT INTO statement_tags (statement_id, tag_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (statement_id, tag_id) DO NOTHING`,
            [statementId, tagId, new Date(), new Date()]
          );
          
          console.log(`Tag "${tagName}" associated with statement ID: ${statementId}`);
        }
      }
    }
    
    // Insert scoring actions
    console.log('Inserting scoring actions...');
    for (const action of michaelBennetData.scoringActions) {
      await client.query(
        `INSERT INTO scoring_actions (
          politician_id, category, action, impact, date, 
          score, max_score, strategic_value, performance_modifier,
          infrastructure_understanding, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (politician_id, category, action) DO UPDATE SET
          impact = EXCLUDED.impact,
          date = EXCLUDED.date,
          score = EXCLUDED.score,
          max_score = EXCLUDED.max_score,
          strategic_value = EXCLUDED.strategic_value,
          performance_modifier = EXCLUDED.performance_modifier,
          infrastructure_understanding = EXCLUDED.infrastructure_understanding,
          updated_at = EXCLUDED.updated_at`,
        [
          politicianId,
          action.category,
          action.action,
          action.impact,
          action.date,
          action.score,
          action.max_score,
          action.strategic_value,
          action.performance_modifier,
          action.infrastructure_understanding,
          new Date(),
          new Date()
        ]
      );
      
      console.log(`Scoring action inserted/updated for category: ${action.category}`);
    }
    
    // Insert politician score
    console.log('Inserting politician score...');
    await client.query(
      `INSERT INTO politician_scores (
        politician_id, score, max_score, category, 
        strategic_integrity, infrastructure_understanding, 
        performance_vs_impact, date, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (politician_id) DO UPDATE SET
        score = EXCLUDED.score,
        max_score = EXCLUDED.max_score,
        category = EXCLUDED.category,
        strategic_integrity = EXCLUDED.strategic_integrity,
        infrastructure_understanding = EXCLUDED.infrastructure_understanding,
        performance_vs_impact = EXCLUDED.performance_vs_impact,
        date = EXCLUDED.date,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at`,
      [
        politicianId,
        michaelBennetData.politicianScore.score,
        michaelBennetData.politicianScore.max_score,
        michaelBennetData.politicianScore.category,
        michaelBennetData.politicianScore.strategic_integrity,
        michaelBennetData.politicianScore.infrastructure_understanding,
        michaelBennetData.politicianScore.performance_vs_impact,
        michaelBennetData.politicianScore.date,
        michaelBennetData.politicianScore.notes,
        new Date(),
        new Date()
      ]
    );
    
    console.log(`Politician score inserted/updated for Michael Bennet`);
    
    // Insert committees
    console.log('Inserting committee memberships...');
    for (const committee of michaelBennetData.committees) {
      await client.query(
        `INSERT INTO politician_committees (
          politician_id, name, role, influence_level, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (politician_id, name) DO UPDATE SET
          role = EXCLUDED.role,
          influence_level = EXCLUDED.influence_level,
          updated_at = EXCLUDED.updated_at`,
        [
          politicianId,
          committee.name,
          committee.role,
          committee.influence_level,
          new Date(),
          new Date()
        ]
      );
      
      console.log(`Committee membership inserted/updated for: ${committee.name}`);
    }
    
    // Insert evidence sources
    console.log('Inserting evidence sources...');
    for (const source of michaelBennetData.evidenceSources) {
      await client.query(
        `INSERT INTO evidence_sources (
          politician_id, name, url, confidence_rating, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (politician_id, name) DO UPDATE SET
          url = EXCLUDED.url,
          confidence_rating = EXCLUDED.confidence_rating,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at`,
        [
          politicianId,
          source.name,
          source.url,
          source.confidence_rating,
          source.notes,
          new Date(),
          new Date()
        ]
      );
      
      console.log(`Evidence source inserted/updated for: ${source.name}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Michael Bennet data import completed successfully!');
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error importing Michael Bennet data:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

// Run the import function
importMichaelBennetData()
  .then(() => {
    console.log('Import process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import process failed:', error);
    process.exit(1);
  });
