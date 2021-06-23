import { Pool } from 'pg'

export default (pool: Pool) => ({
  createWtRelationships: async ({ wordId, tags }) => {
    const rows = await Promise.all(
      tags.map(
        async (tag: number) =>
          (
            await pool.query(
              `
          INSERT INTO wt_relationships (word_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          RETURNING *
          `,
              [wordId, tag],
            )
          ).rows,
      ),
    )

    return rows.map((row) => row[0]?.tag_id)
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
  removeAllWtRelationshipsByWord: async ({ wordId }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM wt_relationships
      WHERE word_id = $1
      RETURNING *
      `,
      [wordId],
    )

    return rows[0]
  },
  removeWtRelationship: async ({ wordId, tagId }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM wt_relationships
      WHERE word_id = $1 AND tag_id = $2
      RETURNING *
      `,
      [wordId, tagId],
    )

    return rows[0]
  },
})
