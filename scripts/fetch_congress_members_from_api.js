const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const API_KEY = process.env.CONGRESS_API_KEY;
const BASE_URL = 'https://api.congress.gov/v3/';

const fetchAllMembers = async () => {
  let allMembers = [];
  let nextUrl = `${BASE_URL}member?limit=250`;

  while (nextUrl) {
    try {
      const response = await axios.get(nextUrl, {
        headers: { 'X-Api-Key': API_KEY }
      });
      const data = response.data;
      allMembers = allMembers.concat(data.members);
      nextUrl = data.pagination.next ? `${data.pagination.next}` : null;
      if(nextUrl) {
        console.log('Waiting 1 second before next request...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      break;
    }
  }

  return allMembers;
};

const main = async () => {
  if (!API_KEY) {
    console.error('Error: CONGRESS_API_KEY not found in .env file.');
    console.log('Please sign up for an API key at https://api.congress.gov/sign-up/.');
    return;
  }

  const members = await fetchAllMembers();
  if (members.length > 0) {
    fs.writeFileSync('../data/congress_members.json', JSON.stringify(members, null, 2));
    console.log(`Successfully fetched and saved ${members.length} members to ../data/congress_members.json`);
  }
};

main();
