require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// ProPublica API key from environment variables
const API_KEY = process.env.PROPUBLICA_API_KEY;

// Check if API key is present
if (!API_KEY) {
  console.error('Error: PROPUBLICA_API_KEY is required but not found in environment variables.');
  console.error('Please create a .env file with your ProPublica API key.');
  process.exit(1);
}

// Base URL for ProPublica Congress API
const BASE_URL = 'https://api.propublica.org/congress/v1';

// Current Congress number
const CONGRESS = 118; // 118th Congress (2023-2025)

// Function to fetch members of a chamber (house or senate)
async function fetchMembers(chamber) {
  try {
    const response = await axios.get(`${BASE_URL}/${CONGRESS}/${chamber}/members.json`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    return response.data.results[0].members;
  } catch (error) {
    console.error(`Error fetching ${chamber} members:`, error.message);
    return [];
  }
}

// Function to fetch committee memberships for a member
async function fetchCommittees(memberId) {
  try {
    const response = await axios.get(`${BASE_URL}/members/${memberId}.json`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    return response.data.results[0].roles[0].committees || [];
  } catch (error) {
    console.error(`Error fetching committees for member ${memberId}:`, error.message);
    return [];
  }
}

// Function to format member data
function formatMemberData(member, chamber) {
  const district = chamber === 'house' ? member.district : 'N/A';
  
  return {
    id: member.id,
    first_name: member.first_name,
    last_name: member.last_name,
    full_name: `${member.first_name} ${member.last_name}`,
    party: member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent',
    state: member.state,
    district: district,
    chamber: chamber === 'house' ? 'House' : 'Senate',
    leadership_role: member.leadership_role || 'N/A',
    office: member.office || 'N/A',
    phone: member.phone || 'N/A',
    url: member.url || 'N/A',
    twitter_account: member.twitter_account || 'N/A',
    facebook_account: member.facebook_account || 'N/A',
    youtube_account: member.youtube_account || 'N/A',
    committees: [], // Will be populated later
    next_election: member.next_election || 'N/A',
    total_votes: member.total_votes || 0,
    missed_votes: member.missed_votes || 0,
    votes_with_party_pct: member.votes_with_party_pct || 0,
    votes_against_party_pct: member.votes_against_party_pct || 0
  };
}

// Main function to fetch and save all members
async function fetchAndSaveAllMembers() {
  console.log('Fetching members of the House...');
  const houseMembers = await fetchMembers('house');
  
  console.log('Fetching members of the Senate...');
  const senateMembers = await fetchMembers('senate');
  
  console.log(`Found ${houseMembers.length} House members and ${senateMembers.length} Senate members.`);
  
  // Format member data
  const formattedHouseMembers = houseMembers.map(member => formatMemberData(member, 'house'));
  const formattedSenateMembers = senateMembers.map(member => formatMemberData(member, 'senate'));
  
  // Combine all members
  const allMembers = [...formattedHouseMembers, ...formattedSenateMembers];
  
  console.log('Fetching committee memberships for each member...');
  
  // Fetch committee memberships for each member (limit to first 10 for testing)
  for (let i = 0; i < allMembers.length; i++) {
    const member = allMembers[i];
    console.log(`Fetching committees for ${member.full_name} (${i + 1}/${allMembers.length})...`);
    
    // Add a delay to avoid rate limiting
    const delay = parseInt(process.env.API_REQUEST_DELAY || '1000', 10);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const committees = await fetchCommittees(member.id);
    member.committees = committees.map(committee => committee.name).join('; ');
  }
  
  // Save to CSV
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, '../data/congress_members.csv'),
    header: [
      { id: 'id', title: 'ID' },
      { id: 'full_name', title: 'Name' },
      { id: 'party', title: 'Party' },
      { id: 'state', title: 'State' },
      { id: 'district', title: 'District' },
      { id: 'chamber', title: 'Chamber' },
      { id: 'leadership_role', title: 'Leadership Role' },
      { id: 'committees', title: 'Committees' },
      { id: 'office', title: 'Office' },
      { id: 'phone', title: 'Phone' },
      { id: 'url', title: 'Website' },
      { id: 'twitter_account', title: 'Twitter' },
      { id: 'facebook_account', title: 'Facebook' },
      { id: 'youtube_account', title: 'YouTube' },
      { id: 'next_election', title: 'Next Election' }
    ]
  });
  
  // Ensure the data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  await csvWriter.writeRecords(allMembers);
  console.log(`Successfully saved ${allMembers.length} members to congress_members.csv`);
  
  // Also save as JSON for easier processing
  fs.writeFileSync(
    path.join(__dirname, '../data/congress_members.json'),
    JSON.stringify(allMembers, null, 2)
  );
  console.log(`Successfully saved ${allMembers.length} members to congress_members.json`);
}

// Run the main function
fetchAndSaveAllMembers().catch(console.error);
