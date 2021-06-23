import Router from '@koa/router'
import auth from '../auth'
import db from '../db'

const words = new Router()

/**
 * Create Word
 */

interface CreateWordBody {
  spelling?: string
  meaning?: string
  tags?: number[]
}

words.post('/words', auth.middleware(), async (ctx) => {
  const { spelling, meaning, tags = [] } = ctx.request.body as CreateWordBody

  if (!spelling || !meaning) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !spelling
          ? 'The field `spelling` is mandatory.'
          : 'The field `meaning` is mandatory.',
      },
    }

    return
  }

  const result = await db.createWord({
    author: ctx.user.id,
    meaning,
    spelling,
  })

  const storedTags = await db.createWtRelationships({ wordId: result.id, tags })
  result.tags = storedTags

  ctx.status = 201
  ctx.body = result
})

/**
 * Get Word
 */

words.get('/words/:id', auth.middleware(), async (ctx) => {
  const result = await db.getWord({ id: ctx.params.id, author: ctx.user.id })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find the word.',
      },
    }

    return
  }

  const tags = await db.getTagsWithWord({ wordId: ctx.params.id })
  result.tags = tags

  ctx.status = 200
  ctx.body = result
})

/**
 * Get All Words
 */

words.get('/words', auth.middleware(), async (ctx) => {
  const result = await db.getAllWords({ author: ctx.user.id })

  const resultWithTags = await Promise.all(
    result.map(async (word) => {
      const tags = await db.getTagsWithWord({ wordId: word.id })
      word.tags = tags
      return word
    }),
  )

  ctx.status = 200
  ctx.body = resultWithTags
})

/**
 * Edit Word
 */

interface EditWordBody {
  id?: string
  spelling?: string
  meaning?: string
  tags?: number[]
}

words.patch('/words/edit', auth.middleware(), async (ctx) => {
  const { id, spelling, meaning, tags } = ctx.request.body as EditWordBody

  if (!id || !spelling || !meaning) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !id
          ? 'The field `id` is mandatory.'
          : !spelling
          ? 'The field `spelling` is mandatory.'
          : 'The field `meaning` is mandatory',
      },
    }

    return
  }

  // Remove all relationships.
  await db.removeAllWtRelationshipsByWord({ wordId: id })
  // Create all relationships.
  await db.createWtRelationships({ wordId: id, tags })
  // Get the tags stored in db.
  const storedTags = await db.getTagsWithWord({ wordId: id })
  // Update the word.
  const result = await db.editWord({
    id,
    author: ctx.user.id,
    spelling,
    meaning,
  })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find the word.',
      },
    }

    return
  }

  result.tags = storedTags
  ctx.status = 200
  ctx.body = result
})

/**
 * Review Word
 */

interface ReviewWordBody {
  id?: number
  level?: number
}

words.patch('/words/review', auth.middleware(), async (ctx) => {
  const { id, level } = ctx.request.body as ReviewWordBody

  if (!id || !level) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !id
          ? 'The field `id` is mandatory.'
          : 'The field `level` is mandatory.',
      },
    }

    return
  }

  const result = await db.reviewWord({ id, author: ctx.user.id, level })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find that word.',
      },
    }

    return
  }

  ctx.status = 200
  ctx.body = result
})

/**
 * Delete Word
 */

interface DeleteWordBody {
  id?: number
}

words.delete('/words', auth.middleware(), async (ctx) => {
  const { id } = ctx.request.body as DeleteWordBody

  if (!id) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'The field `id` is mandatory.',
      },
    }

    return
  }

  await db.removeAllWtRelationshipsByWord({ wordId: id })
  const result = await db.deleteWord({ id, author: ctx.user.id })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find that word.',
      },
    }

    return
  }

  ctx.status = 204
})

export default words
