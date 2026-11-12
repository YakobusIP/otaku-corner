const { resetE2eDatabase } = require("../shared/reset-database.cjs");

module.exports = async function globalSetup() {
  await resetE2eDatabase();
};
