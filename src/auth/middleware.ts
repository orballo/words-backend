import { verifyToken } from './utils'
import { ExtendableContext, Next } from 'koa'

interface Options {
  roles?: string[]
}

interface AuthContext extends ExtendableContext {
  user?: any
}

// Middleware to authenticate routes.
export default (options?: Options) => (ctx: AuthContext, next: Next) => {
  const defaultOptions = {
    roles: ['admin', 'student'],
  }

  const { roles } = options
    ? Object.assign(defaultOptions, options)
    : defaultOptions

  const token = ctx.cookies.get('words_auth')

  if (!token) {
    ctx.status = 401
    ctx.body = {
      error: {
        code: 401,
        message: 'Token not provided.',
      },
    }

    return
  }

  try {
    const payload = verifyToken(token)
    ctx.status = 200
    ctx.user = payload
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      error: {
        code: 401,
        message: 'Invalid token.',
      },
    }

    return
  }

  if (!roles.includes(ctx.user.role)) {
    ctx.status = 403
    ctx.body = {
      error: {
        code: 403,
        message: 'Insufficient permissions.',
      },
    }

    return
  }

  return next()
}
