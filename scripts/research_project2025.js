require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// API keys from environment variables
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// Check if required API keys are present
if (!NEWS_API_KEY || !TWITTER_BEARER_TOKEN || !GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  console.warn('Warning: One or more API keys are missing. Some functionality may be limited.');
}

// Load congress members data
const loadCongressMembers = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/congress_members.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading congress members data:', error.message);
    return [];
  }
};

// Search for news articles mentioning the politician and Project 2025
async function searchNewsArticles(politician) {
  try {
    const query = encodeURIComponent(`"${politician.full_name}" "Project 2025"`);
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=relevancy&apiKey=${NEWS_API_KEY}`;
    
    const response = await axios.get(url);
    return response.data.articles || [];
  } catch (error) {
    console.error(`Error searching news for ${politician.full_name}:`, error.message);
    return [];
  }
}

// Search for tweets mentioning the politician and Project 2025
async function searchTweets(politician) {
  if (!politician.twitter_account) {
    return [];
  }
  
  try {
    // Note: This is using Twitter API v2 - you'll need to adjust based on your access level
    const query = encodeURIComponent(`from:${politician.twitter_account} "Project 2025" OR #Project2025`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,public_metrics`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      }
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error(`Error searching tweets for ${politician.full_name}:`, error.message);
    return [];
  }
}

// Search for official statements on politician's website
async function searchOfficialStatements(politician) {
  if (!politician.url) {
    return [];
  }
  
  try {
    // Use Google Custom Search API to search the politician's official website
    const query = encodeURIComponent(`"Project 2025" site:${new URL(politician.url).hostname}`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${GOOGLE_CSE_ID}&key=${GOOGLE_API_KEY}`;
    
    const response = await axios.get(url);
    return response.data.items || [];
  } catch (error) {
    console.error(`Error searching official statements for ${politician.full_name}:`, error.message);
    return [];
  }
}

// Search for voting records related to Project 2025 themes
async function searchVotingRecords(politician) {
  // This would typically involve searching congressional voting records
  // For now, we'll return a placeholder
  return [];
}

// Process and categorize the research results
function processResearchResults(politician, newsArticles, tweets, officialStatements, votingRecords) {
  const results = {
    politician_id: politician.id,
    name: politician.full_name,
    party: politician.party,
    state: politician.state,
    district: politician.district,
    chamber: politician.chamber,
    
    // Public statements
    public_statements: [],
    public_statements_count: 0,
    
    // Legislative action
    legislative_actions: [],
    legislative_actions_count: 0,
    
    // Public engagement
    public_engagements: [],
    public_engagements_count: 0,
    
    // Social media
    social_media_posts: [],
    social_media_posts_count: 0,
    
    // Raw data for reference
    raw_news_articles: newsArticles,
    raw_tweets: tweets,
    raw_official_statements: officialStatements,
    raw_voting_records: votingRecords
  };
  
  // Process news articles
  newsArticles.forEach(article => {
    if (article.title && article.url && article.publishedAt) {
      results.public_statements.push({
        type: 'news_mention',
        title: article.title,
        source: article.source?.name || 'Unknown',
        date: article.publishedAt,
        url: article.url,
        snippet: article.description || ''
      });
    }
  });
  
  // Process tweets
  tweets.forEach(tweet => {
    if (tweet.text) {
      results.social_media_posts.push({
        type: 'tweet',
        content: tweet.text,
        date: tweet.created_at,
        url: `https://twitter.com/${politician.twitter_account}/status/${tweet.id}`,
        metrics: tweet.public_metrics
      });
    }
  });
  
  // Process official statements
  officialStatements.forEach(statement => {
    if (statement.title && statement.link) {
      results.public_statements.push({
        type: 'official_statement',
        title: statement.title,
        source: 'Official Website',
        date: statement.pagemap?.metatags?.[0]?.['article:published_time'] || 'Unknown',
        url: statement.link,
        snippet: statement.snippet || ''
      });
    }
  });
  
  // Process voting records
  votingRecords.forEach(record => {
    results.legislative_actions.push(record);
  });
  
  // Update counts
  results.public_statements_count = results.public_statements.length;
  results.legislative_actions_count = results.legislative_actions.length;
  results.public_engagements_count = results.public_engagements.length;
  results.social_media_posts_count = results.social_media_posts.length;
  
  return results;
}

// Main function to research all members
async function researchAllMembers() {
  console.log('Loading congress members data...');
  const members = loadCongressMembers();
  
  if (members.length === 0) {
    console.error('No congress members data found. Please run fetch_congress_members.js first.');
    return;
  }
  
  console.log(`Found ${members.length} congress members. Starting research...`);
  
  const researchResults = [];
  
  // Determine how many members to process
  const processAllMembers = process.env.PROCESS_ALL_MEMBERS === 'true';
  const membersToProcess = parseInt(process.env.MEMBERS_TO_PROCESS || '10', 10);
  
  // Select members to research
  const membersToResearch = processAllMembers ? members : members.slice(0, membersToProcess);
  
  console.log(`Processing ${membersToResearch.length} out of ${members.length} members.`);
  
  for (let i = 0; i < membersToResearch.length; i++) {
    const member = membersToResearch[i];
    console.log(`Researching ${member.full_name} (${i + 1}/${membersToResearch.length})...`);
    
    // Add a delay to avoid rate limiting
    const delay = parseInt(process.env.API_REQUEST_DELAY || '1000', 10);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Perform research
    const newsArticles = await searchNewsArticles(member);
    console.log(`  Found ${newsArticles.length} news articles`);
    
    const tweets = await searchTweets(member);
    console.log(`  Found ${tweets.length} tweets`);
    
    const officialStatements = await searchOfficialStatements(member);
    console.log(`  Found ${officialStatements.length} official statements`);
    
    const votingRecords = await searchVotingRecords(member);
    console.log(`  Found ${votingRecords.length} voting records`);
    
    // Process results
    const results = processResearchResults(
      member, 
      newsArticles, 
      tweets, 
      officialStatements, 
      votingRecords
    );
    
    researchResults.push(results);
    
    // Save intermediate results to avoid losing data if the script crashes
    if (i % 10 === 0 || i === membersToResearch.length - 1) {
      fs.writeFileSync(
        path.join(__dirname, '../data/research_results_partial.json'),
        JSON.stringify(researchResults, null, 2)
      );
    }
  }
  
  // Save final results
  fs.writeFileSync(
    path.join(__dirname, '../data/research_results.json'),
    JSON.stringify(researchResults, null, 2)
  );
  
  console.log(`Successfully saved research results for ${researchResults.length} members.`);
  
  // Also save a summary CSV
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, '../data/research_summary.csv'),
    header: [
      { id: 'name', title: 'Name' },
      { id: 'party', title: 'Party' },
      { id: 'state', title: 'State' },
      { id: 'district', title: 'District' },
      { id: 'chamber', title: 'Chamber' },
      { id: 'public_statements_count', title: 'Public Statements' },
      { id: 'legislative_actions_count', title: 'Legislative Actions' },
      { id: 'public_engagements_count', title: 'Public Engagements' },
      { id: 'social_media_posts_count', title: 'Social Media Posts' }
    ]
  });
  
  await csvWriter.writeRecords(researchResults);
  console.log('Successfully saved research summary to CSV.');
}

// Run the main function
researchAllMembers().catch(console.error);
