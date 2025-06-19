const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');

const umzug = new Umzug({
  migrations: { 
    glob: path.join(__dirname, 'migrations/*.js'),
    resolve: ({ name, path: migrationPath, context }) => {
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(context, sequelize.constructor),
        down: async () => migration.down(context, sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

(async () => {
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  await umzug.up();
})();
