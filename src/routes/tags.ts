import Router from '@koa/router'
import * as auth from '../auth'
import db from '../db'

const tags = new Router()

/**
 * Create Tag
 */

interface CreateTagBody {
  name?: string
}

tags.post('/tags', auth.middleware(), async (ctx) => {
  const { name } = ctx.request.body as CreateTagBody

  if (!name) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'The field `name` is mandatory.',
      },
    }

    return
  }

  try {
    const result = await db.createTag({ author: ctx.user.id, name })

    ctx.status = 201
    ctx.body = result
  } catch (error) {
    if (error.code === '23505') {
      ctx.status = 400
      ctx.body = {
        error: {
          code: 400,
          message: 'A tag with that `name` already exists.',
        },
      }

      return
    }

    ctx.status = 500
    ctx.body = {
      error: {
        code: 500,
        message: 'Something went wrong with the database.',
      },
    }
  }
})

/**
 * Get Tag
 */

tags.get('/tags/:id', auth.middleware(), async (ctx) => {
  const result = await db.getTag({ id: ctx.params.id, author: ctx.user.id })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find the tag.',
      },
    }

    return
  }

  ctx.status = 200
  ctx.body = result
})

/**
 * Get All Tags
 */

tags.get('/tags', auth.middleware(), async (ctx) => {
  const result = await db.getAllTags({ author: ctx.user.id })

  ctx.status = 200
  ctx.body = result
})

/**
 * Edit Tag
 */

interface EditTagBody {
  id?: number
  name?: string
}

tags.patch('/tags/edit', auth.middleware(), async (ctx) => {
  const { id, name } = ctx.request.body as EditTagBody

  if (!id || !name) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !id
          ? 'The field `id` is mandatory.'
          : 'The field `name` is mandatory',
      },
    }

    return
  }

  const result = await db.editTag({
    id,
    author: ctx.user.id,
    name,
  })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find the tag.',
      },
    }

    return
  }

  ctx.status = 200
  ctx.body = result
})

/**
 * Delete Tag
 */

interface DeleteTagBody {
  id?: number
}

tags.delete('/tags', auth.middleware(), async (ctx) => {
  const { id } = ctx.request.body as DeleteTagBody

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

  await db.removeAllWtRelationshipsByTag({ tagId: id })
  const result = await db.deleteTag({ id, author: ctx.user.id })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      error: {
        code: 404,
        message: 'Cannot find that tag.',
      },
    }

    return
  }

  ctx.status = 204
})

export default tags
