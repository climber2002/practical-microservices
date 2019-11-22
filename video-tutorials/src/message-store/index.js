const VersionConflictError = require('./version-conflict-error')
const createWrite = require('./write')

function createMessageStore ({ db }) {
  // ...
  const write = createWrite({ db })

  return {
    write: write.write
  }
}

module.exports = exports = createMessageStore
exports.VersionConflictError = VersionConflictError
