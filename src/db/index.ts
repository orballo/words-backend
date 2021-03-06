import { Pool } from 'pg'
import words from './words'
import tags from './tags'
import wtRelationships from './wt-relationships'

const pool =
  process.env.NODE_ENV === 'production'
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      })
    : new Pool()

export default {
  init: async () => {
    // Initialize words.
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY NOT NULL,
        author INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        spelling TEXT NOT NULL,
        meaning TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 0,
        reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
      `,
    )

    // Initialize tags.
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY NOT NULL,
        author INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name TEXT NOT NULL UNIQUE
      )
      `,
    )

    // Initialize words-tags relationships.
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS wt_relationships (
        word_id SERIAL REFERENCES words(id),
        tag_id SERIAL REFERENCES tags(id),
        PRIMARY KEY(word_id, tag_id)
      )
      `,
    )
  },
  ...words(pool),
  ...tags(pool),
  ...wtRelationships(pool),
}
