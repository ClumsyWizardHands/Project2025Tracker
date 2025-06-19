const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { Sequelize } = require('sequelize');

// Create a direct database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

const importMembers = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Step 1: Set all existing politicians to inactive (soft delete)
    console.log('Setting all existing politicians to inactive...');
    await sequelize.query('UPDATE politicians SET is_active = false');
    
    // Step 2: Read the vetted data
    const vettedDataPath = path.join(__dirname, '../data/vetted_congress_members.json');
    let membersData;
    
    try {
      membersData = JSON.parse(fs.readFileSync(vettedDataPath, 'utf-8'));
      console.log(`Loaded ${membersData.length} vetted members from ${vettedDataPath}`);
    } catch (error) {
      // Fallback to original congress_members.json if vetted data doesn't exist
      console.log('Vetted data not found, falling back to original data...');
      const originalDataPath = path.join(__dirname, '../data/congress_members.json');
      membersData = JSON.parse(fs.readFileSync(originalDataPath, 'utf-8'));
      console.log(`Loaded ${membersData.length} members from ${originalDataPath}`);
    }

    // Step 3: Import/update active members
    let imported = 0;
    let updated = 0;
    
    for (const member of membersData) {
      // Handle both vetted data format and original format
      const bioguideId = member.bioguideId || member.id;
      const name = member.name;
      const party = member.partyName || member.party;
      const state = member.state;
      const chamber = member.chamber || (member.terms && member.terms.item && member.terms.item.find(term => !term.endYear)?.chamber);
      const photoUrl = member.photo_url || (member.depiction && member.depiction.imageUrl);
      
      // Determine position based on chamber
      let position = member.position;
      if (!position && chamber) {
        position = chamber === 'House of Representatives' || chamber === 'House' 
          ? `Representative for ${state}` 
          : `Senator for ${state}`;
      }
      
      if (!bioguideId || !name || !party || !state || !position) {
        console.log(`Skipping incomplete member data:`, { bioguideId, name, party, state, position });
        continue;
      }

      // Check if politician exists
      const [existingPolitician] = await sequelize.query(
        'SELECT id FROM politicians WHERE id = :id',
        {
          replacements: { id: bioguideId },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (existingPolitician) {
        // Update existing politician
        await sequelize.query(
          `UPDATE politicians 
           SET name = :name, 
               party = :party, 
               state = :state, 
               position = :position, 
               photo_url = :photo_url,
               is_active = true,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = :id`,
          {
            replacements: {
              id: bioguideId,
              name: name,
              party: party,
              state: state,
              position: position,
              photo_url: photoUrl
            }
          }
        );
        updated++;
      } else {
        // Insert new politician
        await sequelize.query(
          `INSERT INTO politicians (id, name, party, state, position, photo_url, is_active, created_at, updated_at)
           VALUES (:id, :name, :party, :state, :position, :photo_url, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          {
            replacements: {
              id: bioguideId,
              name: name,
              party: party,
              state: state,
              position: position,
              photo_url: photoUrl || null
            }
          }
        );
        imported++;
      }
    }

    // Step 4: Report results
    const [activeCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM politicians WHERE is_active = true',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const [inactiveCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM politicians WHERE is_active = false',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nImport Summary:');
    console.log(`- New politicians imported: ${imported}`);
    console.log(`- Existing politicians updated: ${updated}`);
    console.log(`- Total active politicians: ${activeCount.count}`);
    console.log(`- Total inactive politicians: ${inactiveCount.count}`);
    console.log('\nSuccessfully imported congress members.');
    
  } catch (error) {
    console.error('Error importing congress members:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

importMembers();
