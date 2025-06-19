require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

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

async function addIsActiveColumn() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'politicians' 
      AND column_name = 'is_active'
    `);

    if (results.length > 0) {
      console.log('Column is_active already exists in politicians table.');
      return;
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE politicians 
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true
    `);

    console.log('Successfully added is_active column to politicians table.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

addIsActiveColumn();
