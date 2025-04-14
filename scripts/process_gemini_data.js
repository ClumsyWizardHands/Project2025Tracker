// No dotenv dependency
const fs = require('fs');
const path = require('path');

// Scoring weights (same as in score_politicians.js)
const SCORING_WEIGHTS = {
  PUBLIC_STATEMENTS: 30, // 0-30 points
  LEGISLATIVE_ACTION: 25, // 0-25 points
  PUBLIC_ENGAGEMENT: 20, // 0-20 points
  SOCIAL_MEDIA: 15, // 0-15 points
  CONSISTENCY: 10 // 0-10 points
};

// Function to parse the Gemini data
function parseGeminiData(rawData) {
  try {
    // The data appears to be incomplete JSON, so we need to fix it
    // First, let's try to extract the array of politicians
    let fixedData = rawData;
    
    // Check if the data starts with a fragment
    if (rawData.trim().startsWith('#Bush_administration')) {
      fixedData = '[{"public_statements": [{"quote_or_summary": "Compared Trump administration to ' + rawData;
    }
    
    // Try to find the beginning of the array
    if (!fixedData.trim().startsWith('[')) {
      fixedData = '[' + fixedData;
    }
    
    // Try to find the end of the array
    if (!fixedData.trim().endsWith(']')) {
      fixedData = fixedData + ']';
    }
    
    // Replace any empty fields with null
    fixedData = fixedData.replace(/:\s*,/g, ': null,');
    fixedData = fixedData.replace(/:\s*}/g, ': null}');
    
    // Parse the JSON
    const data = JSON.parse(fixedData);
    return data;
  } catch (error) {
    console.error('Error parsing Gemini data:', error.message);
    
    // If we can't parse the JSON, try to extract the politicians manually
    const politicians = [];
    
    // Look for member_id fields
    const memberIdRegex = /"member_id":\s*"([^"]+)"/g;
    let match;
    while ((match = memberIdRegex.exec(rawData)) !== null) {
      const memberId = match[1];
      
      // Extract the politician data
      const startIndex = rawData.indexOf('"member_id": "' + memberId + '"');
      let endIndex = rawData.indexOf('"member_id": "', startIndex + 1);
      if (endIndex === -1) {
        endIndex = rawData.length;
      }
      
      const politicianData = rawData.substring(startIndex, endIndex);
      
      // Extract basic info
      const nameMatch = /"full_name":\s*"([^"]+)"/.exec(politicianData);
      const partyMatch = /"party":\s*"([^"]+)"/.exec(politicianData);
      const stateMatch = /"state":\s*"([^"]+)"/.exec(politicianData);
      const chamberMatch = /"chamber":\s*"([^"]+)"/.exec(politicianData);
      
      // Extract summary assessment
      const summaryMatch = /"summary_assessment":\s*"([^"]+)"/.exec(politicianData);
      
      // Extract opposition to antidemocratic movements
      const oppositionMatch = /"opposition_to_antidemocratic_movements":\s*"([^"]+)"/.exec(politicianData);
      
      // Create a politician object
      const politician = {
        member_id: memberId,
        basic_info: {
          full_name: nameMatch ? nameMatch[1] : 'Unknown',
          party: partyMatch ? partyMatch[1] : 'Unknown',
          state: stateMatch ? stateMatch[1] : 'Unknown',
          chamber: chamberMatch ? chamberMatch[1] : 'Unknown'
        },
        positions_on_antidemocratic_principles: {
          summary_assessment: summaryMatch ? summaryMatch[1] : 'Unknown',
          opposition_to_antidemocratic_movements: oppositionMatch ? oppositionMatch[1] : 'Unknown'
        }
      };
      
      politicians.push(politician);
    }
    
    return politicians;
  }
}

// Function to score a politician
function scorePolitician(politician) {
  // Initialize scores
  const scores = {
    public_statements: 0,
    legislative_action: 0,
    public_engagement: 0,
    social_media: 0,
    consistency: 0
  };
  
  // Score public statements
  const oppositionLevel = politician.positions_on_antidemocratic_principles?.opposition_to_antidemocratic_movements;
  if (oppositionLevel) {
    switch (oppositionLevel.toLowerCase()) {
      case 'strong':
        scores.public_statements = SCORING_WEIGHTS.PUBLIC_STATEMENTS;
        break;
      case 'moderate':
        scores.public_statements = Math.round(SCORING_WEIGHTS.PUBLIC_STATEMENTS * 0.7);
        break;
      case 'minimal':
        scores.public_statements = Math.round(SCORING_WEIGHTS.PUBLIC_STATEMENTS * 0.3);
        break;
      case 'supportive': // Supportive of antidemocratic principles
        scores.public_statements = 0;
        break;
      default:
        scores.public_statements = 0;
    }
  }
  
  // Score legislative actions
  // Count the number of key votes that align with democratic principles
  const keyVotes = politician.positions_on_antidemocratic_principles?.legislative_actions?.key_votes;
  if (Array.isArray(keyVotes) && keyVotes.length > 0) {
    let democraticVotes = 0;
    
    keyVotes.forEach(vote => {
      // Check if the vote aligns with democratic principles
      if (vote.bill_number && vote.vote_position) {
        // For the People Act, John Lewis VRA - "Yea" is pro-democracy
        if ((vote.bill_number.includes('S.1') || vote.bill_number.includes('S.4')) && 
            vote.vote_position === 'Yea') {
          democraticVotes++;
        }
        // Electoral Count Reform Act - "Yea" is pro-democracy
        else if (vote.bill_number.includes('S.4573') && vote.vote_position === 'Yea') {
          democraticVotes++;
        }
        // Objections to electoral votes - "Nay" is pro-democracy
        else if ((vote.bill_number.includes('PA Electoral Vote') || 
                 vote.bill_number.includes('AZ Electoral Vote')) && 
                vote.vote_position === 'Nay') {
          democraticVotes++;
        }
        // Impeachment Trial - "Guilty" is pro-democracy
        else if (vote.bill_number.includes('Impeachment Trial') && 
                vote.vote_position === 'Guilty') {
          democraticVotes++;
        }
      }
    });
    
    // Score based on the number of pro-democracy votes
    scores.legislative_action = Math.min(
      Math.round((democraticVotes / keyVotes.length) * SCORING_WEIGHTS.LEGISLATIVE_ACTION),
      SCORING_WEIGHTS.LEGISLATIVE_ACTION
    );
  }
  
  // Score public engagement
  // For now, we'll use the summary assessment as a proxy
  const summaryAssessment = politician.positions_on_antidemocratic_principles?.summary_assessment;
  if (summaryAssessment) {
    switch (summaryAssessment.toLowerCase()) {
      case 'strong':
        scores.public_engagement = SCORING_WEIGHTS.PUBLIC_ENGAGEMENT;
        break;
      case 'moderate':
        scores.public_engagement = Math.round(SCORING_WEIGHTS.PUBLIC_ENGAGEMENT * 0.7);
        break;
      case 'minimal opposition':
      case 'minimal':
        scores.public_engagement = Math.round(SCORING_WEIGHTS.PUBLIC_ENGAGEMENT * 0.3);
        break;
      case 'supportive': // Supportive of antidemocratic principles
        scores.public_engagement = 0;
        break;
      default:
        scores.public_engagement = 0;
    }
  }
  
  // Score social media activity
  const amplificationOfDisinfo = politician.positions_on_antidemocratic_principles?.social_media_activity?.amplification_of_disinformation;
  const extremistRhetoric = politician.positions_on_antidemocratic_principles?.social_media_activity?.engagement_with_extremist_rhetoric;
  
  if (amplificationOfDisinfo === 'False' && extremistRhetoric === 'False') {
    scores.social_media = SCORING_WEIGHTS.SOCIAL_MEDIA;
  } else if (amplificationOfDisinfo === 'True' || extremistRhetoric === 'True') {
    scores.social_media = 0;
  } else {
    // Insufficient data
    scores.social_media = Math.round(SCORING_WEIGHTS.SOCIAL_MEDIA * 0.5);
  }
  
  // Score consistency
  const patternOfEngagement = politician.positions_on_antidemocratic_principles?.consistency_analysis?.pattern_of_engagement;
  if (patternOfEngagement) {
    if (patternOfEngagement.toLowerCase().includes('consistent') && 
        !summaryAssessment.toLowerCase().includes('supportive')) {
      scores.consistency = SCORING_WEIGHTS.CONSISTENCY;
    } else {
      scores.consistency = 0;
    }
  }
  
  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  return {
    ...scores,
    total_score: totalScore
  };
}

// Function to categorize politicians
function categorizePoliticians(scoredPoliticians) {
  // Sort politicians by score
  const sortedPoliticians = [...scoredPoliticians].sort((a, b) => b.scores.total_score - a.scores.total_score);
  
  // Top performers are those with scores >= 70
  const topPerformers = sortedPoliticians.filter(p => p.scores.total_score >= 70);
  
  // Persons of interest are those with scores <= 30
  const personsOfInterest = sortedPoliticians.filter(p => p.scores.total_score <= 30);
  
  return {
    topPerformers,
    personsOfInterest
  };
}

// Function to generate SQL commands
function generateSqlCommands(scoredPoliticians) {
  const sqlCommands = [];
  
  scoredPoliticians.forEach(politician => {
    // Insert politician
    sqlCommands.push(`
-- Insert politician: ${politician.basic_info.full_name}
INSERT INTO "Politicians" (
  "external_id", 
  "name", 
  "party", 
  "state", 
  "district", 
  "chamber"
) VALUES (
  '${politician.member_id}',
  '${politician.basic_info.full_name.replace(/'/g, "''")}',
  '${politician.basic_info.party}',
  '${politician.basic_info.state}',
  ${politician.basic_info.district ? `'${politician.basic_info.district}'` : 'NULL'},
  '${politician.basic_info.chamber}'
) ON CONFLICT ("external_id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "party" = EXCLUDED."party",
  "state" = EXCLUDED."state",
  "district" = EXCLUDED."district",
  "chamber" = EXCLUDED."chamber";
`);
    
    // Insert politician score
    sqlCommands.push(`
-- Insert score for: ${politician.basic_info.full_name}
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
  (SELECT "id" FROM "Politicians" WHERE "external_id" = '${politician.member_id}'),
  ${politician.scores.total_score},
  ${politician.scores.public_statements},
  ${politician.scores.legislative_action},
  ${politician.scores.public_engagement},
  ${politician.scores.social_media},
  ${politician.scores.consistency},
  '${politician.scores.total_score > 0 ? 'Sufficient' : 'Insufficient Data'}',
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
`);
  });
  
  return sqlCommands.join('\n');
}

// Function to generate a summary report
function generateSummaryReport(scoredPoliticians, categories) {
  const { topPerformers, personsOfInterest } = categories;
  
  let report = `# Politician Scoring Summary\n\n`;
  report += `## Overview\n\n`;
  report += `Total politicians processed: ${scoredPoliticians.length}\n`;
  report += `Top performers (score >= 70): ${topPerformers.length}\n`;
  report += `Persons of interest (score <= 30): ${personsOfInterest.length}\n\n`;
  
  report += `## Top Performers\n\n`;
  report += `| Name | Party | State | Chamber | Total Score | Public Statements | Legislative Action | Public Engagement | Social Media | Consistency |\n`;
  report += `|------|-------|-------|---------|-------------|-------------------|-------------------|------------------|--------------|-------------|\n`;
  
  topPerformers.forEach(p => {
    report += `| ${p.basic_info.full_name} | ${p.basic_info.party} | ${p.basic_info.state} | ${p.basic_info.chamber} | ${p.scores.total_score} | ${p.scores.public_statements} | ${p.scores.legislative_action} | ${p.scores.public_engagement} | ${p.scores.social_media} | ${p.scores.consistency} |\n`;
  });
  
  report += `\n## Persons of Interest\n\n`;
  report += `| Name | Party | State | Chamber | Total Score | Public Statements | Legislative Action | Public Engagement | Social Media | Consistency |\n`;
  report += `|------|-------|-------|---------|-------------|-------------------|-------------------|------------------|--------------|-------------|\n`;
  
  personsOfInterest.forEach(p => {
    report += `| ${p.basic_info.full_name} | ${p.basic_info.party} | ${p.basic_info.state} | ${p.basic_info.chamber} | ${p.scores.total_score} | ${p.scores.public_statements} | ${p.scores.legislative_action} | ${p.scores.public_engagement} | ${p.scores.social_media} | ${p.scores.consistency} |\n`;
  });
  
  report += `\n## All Politicians\n\n`;
  report += `| Name | Party | State | Chamber | Total Score | Public Statements | Legislative Action | Public Engagement | Social Media | Consistency |\n`;
  report += `|------|-------|-------|---------|-------------|-------------------|-------------------|------------------|--------------|-------------|\n`;
  
  scoredPoliticians.forEach(p => {
    report += `| ${p.basic_info.full_name} | ${p.basic_info.party} | ${p.basic_info.state} | ${p.basic_info.chamber} | ${p.scores.total_score} | ${p.scores.public_statements} | ${p.scores.legislative_action} | ${p.scores.public_engagement} | ${p.scores.social_media} | ${p.scores.consistency} |\n`;
  });
  
  report += `\n## Data Issues\n\n`;
  report += `The following issues were identified in the data:\n\n`;
  report += `1. Some fields are missing or incomplete (marked as "Insufficient Data")\n`;
  report += `2. The JSON format appears to be malformed in some places\n`;
  report += `3. Some politicians have incomplete data for certain categories\n\n`;
  
  report += `## Recommendations\n\n`;
  report += `1. Request a more complete dataset from Gemini\n`;
  report += `2. Ensure the JSON format is valid\n`;
  report += `3. Fill in missing data through additional research\n`;
  
  return report;
}

// Main function
async function processGeminiData(rawData) {
  // Parse the data
  console.log('Parsing Gemini data...');
  const politicians = parseGeminiData(rawData);
  
  console.log(`Found ${politicians.length} politicians in the data.`);
  
  // Score each politician
  console.log('Scoring politicians...');
  const scoredPoliticians = politicians.map(politician => {
    const scores = scorePolitician(politician);
    return {
      ...politician,
      scores
    };
  });
  
  // Categorize politicians
  console.log('Categorizing politicians...');
  const categories = categorizePoliticians(scoredPoliticians);
  
  // Generate SQL commands
  console.log('Generating SQL commands...');
  const sqlCommands = generateSqlCommands(scoredPoliticians);
  
  // Generate summary report
  console.log('Generating summary report...');
  const summaryReport = generateSummaryReport(scoredPoliticians, categories);
  
  // Save the results
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dataDir, 'gemini_politicians.json'),
    JSON.stringify(scoredPoliticians, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dataDir, 'gemini_sql_commands.sql'),
    sqlCommands
  );
  
  fs.writeFileSync(
    path.join(dataDir, 'gemini_summary_report.md'),
    summaryReport
  );
  
  console.log('Results saved to:');
  console.log(`- data/gemini_politicians.json`);
  console.log(`- data/gemini_sql_commands.sql`);
  console.log(`- data/gemini_summary_report.md`);
  
  return {
    politicians: scoredPoliticians,
    categories,
    sqlCommands,
    summaryReport
  };
}

// If this script is run directly
if (require.main === module) {
  // Check if a file path is provided
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Please provide a file path to the Gemini data.');
    console.error('Usage: node process_gemini_data.js <file_path>');
    process.exit(1);
  }
  
  // Read the file
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    processGeminiData(rawData).catch(console.error);
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseGeminiData,
  scorePolitician,
  categorizePoliticians,
  generateSqlCommands,
  generateSummaryReport,
  processGeminiData
};
