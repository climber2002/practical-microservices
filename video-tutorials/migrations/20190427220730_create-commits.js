exports.up = knex =>
  knex.schema.createTable('message_store_commits', table => {
    table.string('stream').primary()
    table.integer('position').defaultsTo(0)
  })

exports.down = knex => knex.schema.dropTable('message_store_commits')
