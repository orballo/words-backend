import Router from '@koa/router'
import db from './db'
import auth from '../auth'

const words = new Router()

/**
 * Create Word
 */

interface CreateWordBody {
  spelling?: string
  meaning?: string
}

words.post('/words', auth.middleware(), async (ctx) => {
  const { spelling, meaning } = ctx.request.body as CreateWordBody

  if (!spelling || !meaning) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !spelling
          ? 'Spelling field is mandatory.'
          : 'Meaning field is mandatory.',
      },
    }

    return
  }

  const result = await db.createWord({ author: ctx.user.id, meaning, spelling })

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

  ctx.status = 200
  ctx.body = result
})

/**
 * Get All Words
 */

words.get('/words', auth.middleware(), async (ctx) => {
  const result = await db.getAllWords({ author: ctx.user.id })

  ctx.status = 200
  ctx.body = result
})

/**
 * Edit Word
 */

interface EditWordBody {
  id?: string
  spelling?: string
  meaning?: string
}

words.patch('/words/edit', auth.middleware(), async (ctx) => {
  const { id, spelling, meaning } = ctx.request.body as EditWordBody

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
        message: 'Cannot find the word.',
      },
    }

    return
  }

  ctx.status = 200
  ctx.body = result
})

export default () => {
  db.init()
  return words.routes()
}
