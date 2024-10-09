import pg from 'pg'

let pool

export async function init() {
  pool = new pg.Pool({
    user: 'bridge-service',
    host: 'localhost',
    database: 'bridge-service',
    password: 'bridge-service',
    port: 5433,
  })

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })
}

export async function shutdown() {
  await pool.end()
}

export async function getEntry(client, handle) {
  return (
      await client.query({
        text: `SELECT "handle", "hash", "data", "meta", "schema", "account", "symbol", "amount", 
                "state", "previousState", "actions", "processingAction", "processingStart", "created" 
             FROM entries 
             WHERE "handle" = $1`,
        values: [handle],
      })
  ).rows[0]
}

export async function createEntry(client, entry) {
  return (
      await client.query({
        text: `INSERT INTO entries("handle", "hash", "data", "meta", "schema", "account", "symbol", "amount", 
                "state", "previousState", "actions", "processingAction", "processingStart") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
             RETURNING *`,
        values: [entry.handle, entry.hash, entry.data, entry.meta, entry.schema, entry.account, entry.symbol, entry.amount,
          entry.state, entry.previousState, entry.actions, entry.processingAction, entry.processingStart],
      })
  ).rows[0]
}

export async function getEntryForUpdate(client, handle) {
  return (
      await client.query({
        text: `SELECT "handle", "hash", "data", "meta", "schema", "account", "symbol", "amount", 
                "state", "previousState", "actions", "processingAction", "processingStart", "created" 
             FROM entries 
             WHERE "handle" = $1 
             FOR UPDATE`,
        values: [handle],
      })
  ).rows[0]
}

export async function updateEntry(client, entry) {
  return (
      await client.query({
        text: `UPDATE entries SET
        "schema" = $1, 
        "account" = $2, 
        "symbol" = $3, 
        "amount" = $4, 
        "state" = $5,
        "previousState" = $6,
        "actions" = $7,
        "processingAction" = $8,
        "processingStart" = $9 
        WHERE "handle" = $10
        RETURNING *`,
        values: [entry.schema, entry.account, entry.symbol, entry.amount, entry.state, entry.previousState,
          entry.actions, entry.processingAction, entry.processingStart, entry.handle],
      })
  ).rows[0]
}

export async function upsertIntent(client, intent) {
  return (
      await client.query({
        text: `INSERT INTO intents ("handle", "hash", "data", "meta") VALUES ($1, $2, $3, $4)
                ON CONFLICT ("handle") DO
                UPDATE
                    SET "handle" = $1, "hash" = $2, "data" = $3, "meta" = $4
                RETURNING *`,
        values: [intent.handle, intent.hash, intent.data, intent.meta],
      })
  ).rows[0]
}


export async function transactionWrapper(func) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const result = await func(client)

    await client.query('COMMIT')

    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}