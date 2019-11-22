const snakeCaseKeys = require('snakecase-keys')
const VersionConflictError = require('./version-conflict-error')

function createWrite ({ db }) {
  /**
   * @description Inserts a commit row for the given stream.  If a row already
   * existed for that stream, it does nothing
   * @param {string} stream The stream in question
   * @returns {Promise} A promise that resolves when the insert or no-op is
   * complete
   */
  function guaranteeCommitRowExistsForStream (stream) {
    // Only works with PG 9.5 and up
    const rawQuery = `
      INSERT INTO 
        message_store_commits (stream, position)
      VALUES
        (:stream, :position)
      ON CONFLICT DO NOTHING
    `

    return db
      .then(client => client.raw(rawQuery, { stream: stream, position: 0 }))
  }

  /**
   * @description Loads the commit row for the stream at `context.stream` using
   * an update row lock
   * @param {Object} context
   * @param {string} context.stream The stream whose row we lock and load
   */
  function lockAndLoadCommitRow (context) {
    return context.trx('message_store_commits')
      .forUpdate() 
      .where({ stream: context.stream })
      .then(rows => rows[0])
      .then(row => {
        context.commitRow = row

        return context
      })
  }

  /**
   * @description Given a commit row and an expected version, it'll check to see
   * if the stream is currently at the expected version.  If not, it throws a
   * VersionConflictError.
   * @param {Object} context
   * @param {Object} context.commitRow The commit row
   * @param {number} context.commitRow.position The current position of the commit
   * @param {number?} context.expectedVersion If there is an expected version,
   * it'll be a number
   * @throws {VersionConflictError} If there is an expected version, and it does
   * not match the commit's position
   * @returns context A Promise resolving to the context
   */
  function validateExpectedVersion (context) {
    if (typeof context.expectedVersion !== 'undefined') {
      if (context.commitRow.position !== context.expectedVersion) {
        throw new VersionConflictError(
          context.stream,
          context.expectedVersion,
          context.commitRow.position
        )
      }
    }

    return context
  }

  /**
   * @description Generates what the next version id should be based on
   * `context.commitRow` and attaches it to `context` at `context.nextPosition`
   * @param {Object} context
   * @param {Object} context.commitRow
   * @param {number} context.commitRow.position
   * @returns {Object} The updated context
   */
  function generateNextPosition (context) {
    context.nextPosition = context.commitRow.position + 1

    return context
  }

  /**
   * @description Writes a batch of messages to a stream
   * @param {Object} context
   * @param {Object} context.trx Knex transaction object
   * @param {string} context.stream The stream to write to
   * @param {Object} context.messages The message to write
   * @param {number} context.nextPosition The position to assign to the messages
   * @returns {Promise<Object>} A promise resolving to the context
   */
  function writeMessage (context) {
    const insertable = Object.assign(
      {},
      snakeCaseKeys(context.message, { deep: false }),
      { stream: context.stream, position: context.nextPosition }
    )

    return context.trx('message_store_messages')
      .insert(insertable)
      .then(() => context)
  }

  /**
   * @description Updates the commit row for the stream
   * @param {Object} context
   * @param {Object} context.commitRow
   * @param {string} context.commitRow.stream The stream in question
   * @param {number} context.nextPosition The position to update the commit row to
   * @returns {Promise} A Promise that resolves when the commit row is updated
   */
  function updateCommit (context) {
    return context.trx('message_store_commits')
      .update({ position: context.nextPosition }) 
      .where({ stream: context.commitRow.stream })
  }

  /**
   * @description Writes messages to stream(s)
   * @param {Object[]} messages
   * @param {string} messages[].stream A stream to write to
   * @param {Object} messages[].messages The messages to write to the
   *   corresponding stream
   */
  function write (stream, message, expectedVersion) {
    return guaranteeCommitRowExistsForStream(stream)
      .then(() => db)
      .then(client => client.transaction(trx => {
        const context = { expectedVersion, message, stream, trx }

        return lockAndLoadCommitRow(context)
          .then(validateExpectedVersion)
          .then(generateNextPosition)
          .then(writeMessage)
          .then(updateCommit)
      }))
  }

  return { write }
}

module.exports = createWrite

