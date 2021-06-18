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
})
