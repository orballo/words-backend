import { Pool } from 'pg'

export default (pool: Pool) => ({
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
  getWord: async ({ id, author }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM words
      WHERE id = $1 AND author = $2
      `,
      [id, author],
    )

    return rows[0]
  },
  getAllWords: async ({ author }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM words
      WHERE author = $1
      ORDER BY created_at DESC
      `,
      [author],
    )

    return rows
  },
  editWord: async ({ id, author, spelling, meaning }) => {
    const { rows } = await pool.query(
      `
      UPDATE words
      SET spelling = $3, meaning = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND author = $2
      RETURNING *
      `,
      [id, author, spelling, meaning],
    )

    return rows[0]
  },
  reviewWord: async ({ id, author, level }) => {
    const { rows } = await pool.query(
      `
      UPDATE words
      SET level = $3, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND author = $2
      RETURNING *
      `,
      [id, author, level],
    )

    return rows[0]
  },
  deleteWord: async ({ id, author }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM words
      WHERE id = $1 AND author = $2
      RETURNING *
      `,
      [id, author],
    )

    return rows[0]
  },
})
