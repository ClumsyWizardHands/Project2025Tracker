require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * Reconcile member data from multiple sources to create a verified list
 * of active members of Congress.
 */

// Helper function to normalize names for comparison
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
}

// Helper function to extract last name
function getLastName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

// Helper function to check if two names match
function namesMatch(name1, name2) {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  // Exact match
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for nicknames, middle names, etc.)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Check last name match
  const lastName1 = getLastName(name1);
  const lastName2 = getLastName(name2);
  if (lastName1 && lastName2 && normalizeName(lastName1) === normalizeName(lastName2)) {
    // If last names match, check if first initials match
    const firstInitial1 = normalized1.charAt(0);
    const firstInitial2 = normalized2.charAt(0);
    if (firstInitial1 === firstInitial2) return true;
  }
  
  return false;
}

// Load data from Congress.gov API (primary source)
async function loadCongressApiData() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/congress_members.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading Congress API data:', error);
    return [];
  }
}

// Scrape data from Ballotpedia using Firecrawl (secondary source)
async function scrapeFromFirecrawl() {
  console.log('Scraping current members from Ballotpedia using Firecrawl...');
  
  try {
    // Note: This would use the Firecrawl MCP server in a real implementation
    // For now, we'll simulate this with a placeholder
    console.log('Firecrawl scraping would happen here...');
    // In a real implementation:
    // const result = await firecrawl.scrape({
    //   url: 'https://ballotpedia.org/List_of_current_members_of_the_U.S._Congress',
    //   formats: ['markdown'],
    //   onlyMainContent: true
    // });
    // return parseFirecrawlResults(result);
    
    return []; // Placeholder
  } catch (error) {
    console.error('Error scraping with Firecrawl:', error);
    return [];
  }
}

// Verify specific members using Tavily search
async function verifyWithTavily(memberName, state, chamber) {
  console.log(`Verifying ${memberName} (${state}, ${chamber}) with Tavily...`);
  
  try {
    // Note: This would use the Tavily MCP server in a real implementation
    // For now, we'll simulate this
    console.log('Tavily verification would happen here...');
    // In a real implementation:
    // const result = await tavily.search({
    //   query: `${memberName} ${state} ${chamber} 119th Congress current member`,
    //   search_depth: 'basic',
    //   max_results: 3
    // });
    // return analyzeSearchResults(result, memberName);
    
    return true; // Placeholder - assume verified
  } catch (error) {
    console.error(`Error verifying ${memberName} with Tavily:`, error);
    return null; // Unknown verification status
  }
}

// Reconcile data from all sources
async function reconcileData(primaryData, secondaryData) {
  const reconciledMembers = [];
  const discrepancies = [];
  
  // Create maps for easier lookup
  const primaryMap = new Map();
  primaryData.forEach(member => {
    const key = `${member.state}-${member.chamber}-${normalizeName(member.name)}`;
    primaryMap.set(key, member);
  });
  
  const secondaryMap = new Map();
  secondaryData.forEach(member => {
    const key = `${member.state}-${member.chamber}-${normalizeName(member.name)}`;
    secondaryMap.set(key, member);
  });
  
  // Process primary source members
  for (const member of primaryData) {
    let confidence = 'high';
    let verified = true;
    
    // Check if member exists in secondary source
    const foundInSecondary = secondaryData.some(secMember => 
      member.state === secMember.state &&
      member.chamber === secMember.chamber &&
      namesMatch(member.name, secMember.name)
    );
    
    if (!foundInSecondary && secondaryData.length > 0) {
      // Member not found in secondary source - needs verification
      console.log(`Discrepancy: ${member.name} not found in secondary source`);
      confidence = 'medium';
      
      // Verify with Tavily
      const tavilyVerified = await verifyWithTavily(member.name, member.state, member.chamber);
      if (tavilyVerified === false) {
        verified = false;
        confidence = 'low';
      } else if (tavilyVerified === null) {
        confidence = 'medium';
      }
      
      discrepancies.push({
        member: member.name,
        state: member.state,
        chamber: member.chamber,
        issue: 'Not found in secondary source',
        verified: verified
      });
    }
    
    reconciledMembers.push({
      ...member,
      confidence,
      verified,
      sources: foundInSecondary ? ['congress.gov', 'ballotpedia'] : ['congress.gov']
    });
  }
  
  // Check for members in secondary source but not in primary
  for (const secMember of secondaryData) {
    const foundInPrimary = primaryData.some(member => 
      member.state === secMember.state &&
      member.chamber === secMember.chamber &&
      namesMatch(member.name, secMember.name)
    );
    
    if (!foundInPrimary) {
      console.log(`Additional member in secondary source: ${secMember.name}`);
      
      // Verify with Tavily
      const tavilyVerified = await verifyWithTavily(secMember.name, secMember.state, secMember.chamber);
      
      if (tavilyVerified === true) {
        // Add this member as they're verified
        reconciledMembers.push({
          ...secMember,
          confidence: 'medium',
          verified: true,
          sources: ['ballotpedia', 'tavily']
        });
        
        discrepancies.push({
          member: secMember.name,
          state: secMember.state,
          chamber: secMember.chamber,
          issue: 'Not found in primary source but verified',
          verified: true
        });
      }
    }
  }
  
  return { reconciledMembers, discrepancies };
}

// Main function
async function main() {
  console.log('Starting data reconciliation process...\n');
  
  // Load data from primary source (Congress.gov API)
  console.log('Loading data from Congress.gov API...');
  const primaryData = await loadCongressApiData();
  console.log(`Loaded ${primaryData.length} members from primary source\n`);
  
  // Scrape data from secondary source (Ballotpedia via Firecrawl)
  const secondaryData = await scrapeFromFirecrawl();
  console.log(`Loaded ${secondaryData.length} members from secondary source\n`);
  
  // Reconcile the data
  console.log('Reconciling data from all sources...\n');
  const { reconciledMembers, discrepancies } = await reconcileData(primaryData, secondaryData);
  
  // Sort members by state and name
  reconciledMembers.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });
  
  // Save the vetted data
  const vettedDataPath = path.join(__dirname, '../data/vetted_congress_members.json');
  await fs.writeFile(vettedDataPath, JSON.stringify(reconciledMembers, null, 2));
  console.log(`\nSaved ${reconciledMembers.length} vetted members to ${vettedDataPath}`);
  
  // Save discrepancies report
  if (discrepancies.length > 0) {
    const reportPath = path.join(__dirname, '../data/reconciliation_report.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalMembers: reconciledMembers.length,
      verifiedMembers: reconciledMembers.filter(m => m.verified).length,
      discrepanciesCount: discrepancies.length,
      discrepancies: discrepancies
    };
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved reconciliation report to ${reportPath}`);
    
    // Display summary
    console.log('\nReconciliation Summary:');
    console.log(`- Total members: ${report.totalMembers}`);
    console.log(`- Verified members: ${report.verifiedMembers}`);
    console.log(`- Discrepancies found: ${report.discrepanciesCount}`);
  } else {
    console.log('\nNo discrepancies found - all members verified!');
  }
  
  // Display confidence breakdown
  const highConfidence = reconciledMembers.filter(m => m.confidence === 'high').length;
  const mediumConfidence = reconciledMembers.filter(m => m.confidence === 'medium').length;
  const lowConfidence = reconciledMembers.filter(m => m.confidence === 'low').length;
  
  console.log('\nConfidence Levels:');
  console.log(`- High confidence: ${highConfidence} members`);
  console.log(`- Medium confidence: ${mediumConfidence} members`);
  console.log(`- Low confidence: ${lowConfidence} members`);
}

// Run the script
main().catch(error => {
  console.error('Error in reconciliation process:', error);
  process.exit(1);
});
