import { Pool } from 'pg'

export default (pool: Pool) => ({
  createTag: async ({ author, name }) => {
    const { rows } = await pool.query(
      `
      INSERT INTO tags (author, name)
      VALUES ($1, $2)
      RETURNING *
      `,
      [author, name],
    )

    return rows[0]
  },
  getTag: async ({ id, author }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM tags
      WHERE id = $1 AND author = $2
      `,
      [id, author],
    )

    return rows[0]
  },
  getAllTags: async ({ author }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM tags
      WHERE author = $1
      `,
      [author],
    )

    return rows
  },
  editTag: async ({ id, author, name }) => {
    const { rows } = await pool.query(
      `
      UPDATE tags
      SET name = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND author = $2
      RETURNING *
      `,
      [id, author, name],
    )

    return rows[0]
  },
  deleteTag: async ({ id, author }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM tags
      WHERE id = $1 AND author = $2
      RETURNING *
      `,
      [id, author],
    )

    return rows[0]
  },
})
