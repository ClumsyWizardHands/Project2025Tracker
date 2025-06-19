const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get database configuration from environment variables
const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} = process.env;

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: NODE_ENV === 'production' ? DB_HOST : 'localhost',
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: NODE_ENV === 'production',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Export the Sequelize instance
module.exports = sequelize;
