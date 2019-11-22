const createDb = require('./db');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');

function createConfig({ env }) {
  const db = createDb({
    connectionString: env.databaseUrl
  });
  const messageStore = createMessageStore({ db });
  const homeApp = createHomeApp({ db });
  const recordViewingsApp = createRecordViewingsApp({ messageStore });

  return {
    env,
    db,
    messageStore,
    homeApp,
    recordViewingsApp,
  }
}

module.exports = createConfig;
