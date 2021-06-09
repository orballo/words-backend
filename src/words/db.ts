import { Pool } from 'pg'

const pool = new Pool()

export default {
  init: () => {
    pool.query(
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
  },
  createWord: async ({ author, spelling, meaning }) => {
    const { rows } = await pool.query(
      `
      INSERT INTO words (author, spelling, meaning)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [author, spelling, meaning],
    )

    return rows[0]
  },
  getWord: async ({ id }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM words
      WHERE id = $1
      `,
      [id],
    )

    return rows[0]
  },
  getAllWords: async () => {
    const { rows } = await pool.query(
      `
      SELECT * FROM words
      `,
    )

    return rows
  },
  editWord: async ({ id, spelling, meaning }) => {
    const { rows } = await pool.query(
      `
      UPDATE words
      SET spelling = $2, meaning = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id, spelling, meaning],
    )

    return rows[0]
  },
  reviewWord: async ({ id, level }) => {
    const { rows } = await pool.query(
      `
      UPDATE words
      SET level = $2, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id, level],
    )

    return rows[0]
  },
}
