require('dotenv').config();
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Load research results
const loadResearchResults = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/research_results.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading research results:', error.message);
    return [];
  }
};

// Scoring weights
const SCORING_WEIGHTS = {
  PUBLIC_STATEMENTS: 30, // 0-30 points
  LEGISLATIVE_ACTION: 25, // 0-25 points
  PUBLIC_ENGAGEMENT: 20, // 0-20 points
  SOCIAL_MEDIA: 15, // 0-15 points
  CONSISTENCY: 10 // 0-10 points
};

// Scoring function for public statements
function scorePublicStatements(statements) {
  if (!statements || statements.length === 0) {
    return {
      score: 0,
      explanation: 'No public statements found regarding Project 2025.'
    };
  }
  
  // Count statements by type
  const statementTypes = statements.reduce((acc, statement) => {
    acc[statement.type] = (acc[statement.type] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate base score based on number of statements
  let score = Math.min(statements.length * 5, 20);
  
  // Bonus points for official statements (more weight than news mentions)
  const officialStatementCount = statementTypes['official_statement'] || 0;
  score += Math.min(officialStatementCount * 3, 10);
  
  // Cap at maximum score
  score = Math.min(score, SCORING_WEIGHTS.PUBLIC_STATEMENTS);
  
  return {
    score,
    explanation: `Based on ${statements.length} public statements (${officialStatementCount} official statements).`
  };
}

// Scoring function for legislative actions
function scoreLegislativeActions(actions) {
  if (!actions || actions.length === 0) {
    return {
      score: 0,
      explanation: 'No legislative actions found related to Project 2025 themes.'
    };
  }
  
  // For now, simple scoring based on number of actions
  const score = Math.min(actions.length * 5, SCORING_WEIGHTS.LEGISLATIVE_ACTION);
  
  return {
    score,
    explanation: `Based on ${actions.length} legislative actions related to Project 2025 themes.`
  };
}

// Scoring function for public engagements
function scorePublicEngagements(engagements) {
  if (!engagements || engagements.length === 0) {
    return {
      score: 0,
      explanation: 'No public engagements found where Project 2025 was discussed.'
    };
  }
  
  // For now, simple scoring based on number of engagements
  const score = Math.min(engagements.length * 5, SCORING_WEIGHTS.PUBLIC_ENGAGEMENT);
  
  return {
    score,
    explanation: `Based on ${engagements.length} public engagements where Project 2025 was discussed.`
  };
}

// Scoring function for social media activity
function scoreSocialMedia(posts) {
  if (!posts || posts.length === 0) {
    return {
      score: 0,
      explanation: 'No social media posts found mentioning Project 2025.'
    };
  }
  
  // Calculate base score based on number of posts
  let score = Math.min(posts.length * 3, 10);
  
  // Bonus points for engagement (if metrics are available)
  let totalEngagement = 0;
  posts.forEach(post => {
    if (post.metrics) {
      const engagement = (post.metrics.retweet_count || 0) + 
                         (post.metrics.reply_count || 0) + 
                         (post.metrics.like_count || 0);
      totalEngagement += engagement;
    }
  });
  
  // Add bonus for high engagement
  if (totalEngagement > 1000) {
    score += 5;
  } else if (totalEngagement > 500) {
    score += 3;
  } else if (totalEngagement > 100) {
    score += 1;
  }
  
  // Cap at maximum score
  score = Math.min(score, SCORING_WEIGHTS.SOCIAL_MEDIA);
  
  return {
    score,
    explanation: `Based on ${posts.length} social media posts with ${totalEngagement} total engagements.`
  };
}

// Scoring function for consistency
function scoreConsistency(politician, publicStatementsScore, legislativeActionsScore, publicEngagementsScore, socialMediaScore) {
  // If there's not enough data, mark as "Insufficient Data"
  const totalDataPoints = 
    (publicStatementsScore > 0 ? 1 : 0) + 
    (legislativeActionsScore > 0 ? 1 : 0) + 
    (publicEngagementsScore > 0 ? 1 : 0) + 
    (socialMediaScore > 0 ? 1 : 0);
  
  if (totalDataPoints < 2) {
    return {
      score: 0,
      explanation: 'Insufficient data to evaluate consistency.'
    };
  }
  
  // Calculate consistency based on standard deviation of normalized scores
  const maxScores = [
    SCORING_WEIGHTS.PUBLIC_STATEMENTS,
    SCORING_WEIGHTS.LEGISLATIVE_ACTION,
    SCORING_WEIGHTS.PUBLIC_ENGAGEMENT,
    SCORING_WEIGHTS.SOCIAL_MEDIA
  ];
  
  const scores = [
    publicStatementsScore,
    legislativeActionsScore,
    publicEngagementsScore,
    socialMediaScore
  ];
  
  // Normalize scores (as percentages of their max possible value)
  const normalizedScores = scores.map((score, i) => 
    maxScores[i] > 0 ? (score / maxScores[i]) * 100 : 0
  ).filter(score => score > 0); // Only consider categories with data
  
  // Calculate mean
  const mean = normalizedScores.reduce((sum, score) => sum + score, 0) / normalizedScores.length;
  
  // Calculate standard deviation
  const squaredDiffs = normalizedScores.map(score => Math.pow(score - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / normalizedScores.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert standard deviation to a consistency score (lower std dev = higher consistency)
  // StdDev of 0 = perfect consistency = 10 points
  // StdDev of 50 or more = poor consistency = 0 points
  let consistencyScore = Math.max(0, 10 - (stdDev / 5));
  
  return {
    score: Math.round(consistencyScore),
    explanation: `Based on consistency across ${normalizedScores.length} categories with data.`
  };
}

// Calculate overall score
function calculateOverallScore(componentScores) {
  return Object.values(componentScores).reduce((total, component) => total + component.score, 0);
}

// Score a single politician
function scorePolitician(politician) {
  // Score each component
  const publicStatementsResult = scorePublicStatements(politician.public_statements);
  const legislativeActionsResult = scoreLegislativeActions(politician.legislative_actions);
  const publicEngagementsResult = scorePublicEngagements(politician.public_engagements);
  const socialMediaResult = scoreSocialMedia(politician.social_media_posts);
  
  // Score consistency
  const consistencyResult = scoreConsistency(
    politician,
    publicStatementsResult.score,
    legislativeActionsResult.score,
    publicEngagementsResult.score,
    socialMediaResult.score
  );
  
  // Compile component scores
  const componentScores = {
    public_statements: publicStatementsResult,
    legislative_action: legislativeActionsResult,
    public_engagement: publicEngagementsResult,
    social_media: socialMediaResult,
    consistency: consistencyResult
  };
  
  // Calculate overall score
  const overallScore = calculateOverallScore(componentScores);
  
  // Determine if there's enough data
  const hasEnoughData = 
    publicStatementsResult.score > 0 || 
    legislativeActionsResult.score > 0 || 
    publicEngagementsResult.score > 0 || 
    socialMediaResult.score > 0;
  
  return {
    politician_id: politician.politician_id,
    name: politician.name,
    party: politician.party,
    state: politician.state,
    district: politician.district,
    chamber: politician.chamber,
    
    // Component scores
    public_statements_score: publicStatementsResult.score,
    public_statements_explanation: publicStatementsResult.explanation,
    
    legislative_action_score: legislativeActionsResult.score,
    legislative_action_explanation: legislativeActionsResult.explanation,
    
    public_engagement_score: publicEngagementsResult.score,
    public_engagement_explanation: publicEngagementsResult.explanation,
    
    social_media_score: socialMediaResult.score,
    social_media_explanation: socialMediaResult.explanation,
    
    consistency_score: consistencyResult.score,
    consistency_explanation: consistencyResult.explanation,
    
    // Overall score
    overall_score: overallScore,
    
    // Data sufficiency
    has_enough_data: hasEnoughData,
    data_status: hasEnoughData ? 'Sufficient' : 'Insufficient Data'
  };
}

// Main function to score all politicians
async function scoreAllPoliticians() {
  console.log('Loading research results...');
  const researchResults = loadResearchResults();
  
  if (researchResults.length === 0) {
    console.error('No research results found. Please run research_project2025.js first.');
    return;
  }
  
  console.log(`Found research results for ${researchResults.length} politicians. Calculating scores...`);
  
  // Score each politician
  const scoredPoliticians = researchResults.map(politician => {
    console.log(`Scoring ${politician.name}...`);
    return scorePolitician(politician);
  });
  
  // Save scores to JSON
  fs.writeFileSync(
    path.join(__dirname, '../data/politician_scores.json'),
    JSON.stringify(scoredPoliticians, null, 2)
  );
  
  console.log(`Successfully saved scores for ${scoredPoliticians.length} politicians.`);
  
  // Also save a CSV for easy viewing
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, '../data/politician_scores.csv'),
    header: [
      { id: 'name', title: 'Name' },
      { id: 'party', title: 'Party' },
      { id: 'state', title: 'State' },
      { id: 'district', title: 'District' },
      { id: 'chamber', title: 'Chamber' },
      { id: 'overall_score', title: 'Overall Score' },
      { id: 'public_statements_score', title: 'Public Statements Score' },
      { id: 'legislative_action_score', title: 'Legislative Action Score' },
      { id: 'public_engagement_score', title: 'Public Engagement Score' },
      { id: 'social_media_score', title: 'Social Media Score' },
      { id: 'consistency_score', title: 'Consistency Score' },
      { id: 'data_status', title: 'Data Status' }
    ]
  });
  
  await csvWriter.writeRecords(scoredPoliticians);
  console.log('Successfully saved scores to CSV.');
  
  // Generate summary statistics
  const summary = generateSummaryStatistics(scoredPoliticians);
  
  // Save summary to JSON
  fs.writeFileSync(
    path.join(__dirname, '../data/score_summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('Successfully saved summary statistics.');
  
  return scoredPoliticians;
}

// Generate summary statistics
function generateSummaryStatistics(scoredPoliticians) {
  // Filter out politicians with insufficient data
  const politiciansWithData = scoredPoliticians.filter(p => p.has_enough_data);
  
  // Calculate average scores
  const averageScore = politiciansWithData.reduce((sum, p) => sum + p.overall_score, 0) / 
                      (politiciansWithData.length || 1);
  
  // Calculate average scores by party
  const democratScores = politiciansWithData.filter(p => p.party === 'Democrat');
  const republicanScores = politiciansWithData.filter(p => p.party === 'Republican');
  const independentScores = politiciansWithData.filter(p => p.party === 'Independent');
  
  const averageDemocratScore = democratScores.reduce((sum, p) => sum + p.overall_score, 0) / 
                              (democratScores.length || 1);
  const averageRepublicanScore = republicanScores.reduce((sum, p) => sum + p.overall_score, 0) / 
                                (republicanScores.length || 1);
  const averageIndependentScore = independentScores.reduce((sum, p) => sum + p.overall_score, 0) / 
                                 (independentScores.length || 1);
  
  // Calculate average scores by chamber
  const houseScores = politiciansWithData.filter(p => p.chamber === 'House');
  const senateScores = politiciansWithData.filter(p => p.chamber === 'Senate');
  
  const averageHouseScore = houseScores.reduce((sum, p) => sum + p.overall_score, 0) / 
                           (houseScores.length || 1);
  const averageSenateScore = senateScores.reduce((sum, p) => sum + p.overall_score, 0) / 
                            (senateScores.length || 1);
  
  // Find top performers
  const topPerformers = [...politiciansWithData]
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 10);
  
  // Find persons of interest (lowest scores)
  const personsOfInterest = [...politiciansWithData]
    .sort((a, b) => a.overall_score - b.overall_score)
    .slice(0, 10);
  
  // Count politicians by data status
  const sufficientDataCount = politiciansWithData.length;
  const insufficientDataCount = scoredPoliticians.length - politiciansWithData.length;
  
  return {
    total_politicians: scoredPoliticians.length,
    politicians_with_data: sufficientDataCount,
    politicians_without_data: insufficientDataCount,
    
    average_score: Math.round(averageScore * 10) / 10,
    
    party_breakdown: {
      democrat: {
        count: democratScores.length,
        average_score: Math.round(averageDemocratScore * 10) / 10
      },
      republican: {
        count: republicanScores.length,
        average_score: Math.round(averageRepublicanScore * 10) / 10
      },
      independent: {
        count: independentScores.length,
        average_score: Math.round(averageIndependentScore * 10) / 10
      }
    },
    
    chamber_breakdown: {
      house: {
        count: houseScores.length,
        average_score: Math.round(averageHouseScore * 10) / 10
      },
      senate: {
        count: senateScores.length,
        average_score: Math.round(averageSenateScore * 10) / 10
      }
    },
    
    top_performers: topPerformers.map(p => ({
      name: p.name,
      party: p.party,
      state: p.state,
      chamber: p.chamber,
      score: p.overall_score
    })),
    
    persons_of_interest: personsOfInterest.map(p => ({
      name: p.name,
      party: p.party,
      state: p.state,
      chamber: p.chamber,
      score: p.overall_score
    }))
  };
}

// Run the main function
scoreAllPoliticians().catch(console.error);
