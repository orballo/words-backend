import Router from '@koa/router'
import db from './db'
import sendEmail from './email'
import { generateCode, generateToken, verifyToken } from './utils'

const router = new Router()

interface SignupBody {
  email?: string
  username?: string
  code?: string
}

interface SigninBody {
  email?: string
  code?: string
}

interface DeleteBody {
  code?: string
}

// Sign Up.
router.post('/auth/signup', async (ctx) => {
  const { email, username, code } = ctx.request.body as SignupBody

  // Return error if `username` or `email` are not provided.
  if (!email || !username) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: !email ? 'Email not provided.' : 'Username not provided.',
      },
    }

    return
  }

  // Return error if `email` already exists.
  const userByEmail = await db.getUserByEmail({ email })
  if (userByEmail) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'The email provided is already in use.',
      },
    }

    return
  }

  // Return error if `username` already exists.
  const userByUsername = await db.getUserByUsername({ username })
  if (userByUsername) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'The username provided is already in use.',
      },
    }

    return
  }

  // Send a verification code if `code` is not provided.
  if (!code) {
    const generatedCode = generateCode()
    const result = await db.saveCode({ email, code: generatedCode })
    ctx.status = 200
    ctx.body = result

    sendEmail(generatedCode)

    // Invalidate code after 5 minutes.
    setInterval(() => {
      db.deleteCode({ email })
    }, 1000 * 60 * 5)

    return
  }

  // Return error if `code` does not match the stored code.
  const { code: storedCode } = await db.getCode({ email })
  if (code !== storedCode) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'Invalid code provided.',
      },
    }

    return
  }

  // Create a new user with the data provided.
  const result = await db.createUser({ username, email })

  // Generate a new token to authenticate the user.
  const generatedToken = generateToken(result)

  // Return the new created user and the authentication token.
  ctx.status = 201
  ctx.body = result
  ctx.cookies.set('words_auth', generatedToken)

  // Delete the stored code once it was used.
  db.deleteCode({ email })
})

// Sign In.
router.post('/auth/signin', async (ctx) => {
  const { email, code } = ctx.request.body as SigninBody

  // Return error if `email` is not provided.
  if (!email) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'Email not provided.',
      },
    }

    return
  }

  const user = await db.getUserByEmail({ email })

  // Return error if `email` does not exist.
  if (!user) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'The email provided does not exist.',
      },
    }

    return
  }

  // Send a verification code if `code` is not provided.
  if (!code) {
    const generatedCode = generateCode()
    const result = await db.saveCode({ email, code: generatedCode })
    ctx.status = 200
    ctx.body = result

    sendEmail(generatedCode)

    // Invalidate code after 5 minutes.
    setInterval(() => {
      db.deleteCode({ email })
    }, 1000 * 60 * 5)

    return
  }

  // Return error if `code` does not match the stored code.
  const { code: storedCode } = await db.getCode({ email })
  if (code !== storedCode) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'Invalid code provided.',
      },
    }

    return
  }

  // Generate a new token to authenticate the user.
  const generatedToken = generateToken(user)

  // Return the new created user and the authentication token.
  ctx.body = user
  ctx.cookies.set('words_auth', generatedToken)

  // Delete the stored code once it was used.
  db.deleteCode({ email })
})

// Sign Out.
router.get('/auth/signout', async (ctx) => {
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
    verifyToken(token)
    ctx.cookies.set('words_auth')
    ctx.status = 204
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      error: {
        code: 401,
        message: 'Invalid token',
      },
    }
  }
})

// Delete.
router.delete('/auth/delete', async (ctx) => {
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

  let user: any

  try {
    user = verifyToken(token)
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      error: {
        code: 401,
        message: 'Invalid token',
      },
    }

    return
  }

  const { code } = ctx.request.body as DeleteBody

  // Send a verification code if `code` is not provided.
  if (!code) {
    const generatedCode = generateCode()
    const result = await db.saveCode({ email: user.email, code: generatedCode })
    ctx.status = 200
    ctx.body = result

    sendEmail(generatedCode)

    // Invalidate code after 5 minutes.
    setInterval(() => {
      db.deleteCode({ email: user.email })
    }, 1000 * 60 * 5)

    return
  }

  // Return error if `code` does not match the stored code.
  const { code: storedCode } = await db.getCode({ email: user.email })
  if (code !== storedCode) {
    ctx.status = 400
    ctx.body = {
      error: {
        code: 400,
        message: 'Invalid code provided.',
      },
    }

    return
  }

  await db.deleteUser({ id: user.id })
  ctx.cookies.set('words_auth')
  ctx.status = 204

  db.deleteCode({ email: user.email })
})

export default () => {
  db.init()
  return router.routes()
}
