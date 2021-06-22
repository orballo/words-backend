import { Pool } from 'pg'

export default (pool: Pool) => ({
  createWtRelationships: async ({ wordId, tags }) => {
    await Promise.all(
      tags.map((tag: number) =>
        pool.query(
          `
          INSERT INTO wt_relationships (word_id, tag_id)
          VALUES ($1, $2)
          `,
          [wordId, tag],
        ),
      ),
    )
  },
  getTagsWithWord: async ({ wordId }) => {
    const { rows } = await pool.query(
      `
      SELECT tag_id FROM wt_relationships
      WHERE word_id = $1
      `,
      [wordId],
    )

    return rows.map(({ tag_id }) => tag_id)
  },
})
