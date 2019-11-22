exports.up = function up (knex) {
  return knex.schema.createTable('message_store_messages', table => {
    table.increments()
    table.string('type')
    table.string('stream')
    table.string('correlation_id')
    table.string('user_id')
    table.integer('position')
    table.json('payload')
    table.timestamp('timestamp').defaultTo(knex.fn.now())

    table.index('stream')
  })
}

exports.down = knex => knex.schema.dropTable('message_store_messages')
