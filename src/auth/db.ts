import { Pool } from 'pg'

const pool =
  process.env.NODE_ENV === 'production'
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      })
    : new Pool()

export default {
  init: async () => {
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        role TEXT NOT NULL DEFAULT 'student'
      )
      `,
    )

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS auth_codes (
        email TEXT PRIMARY KEY NOT NULL,
        code TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `,
    )
  },
  saveCode: async ({ email, code }) => {
    const { rows } = await pool.query(
      `
      INSERT INTO auth_codes (email, code)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET code = $2, timestamp = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [email, code],
    )

    return rows[0]
  },
  getCode: async ({ email }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM auth_codes
      WHERE email = $1
      `,
      [email],
    )

    return rows[0] || { code: undefined }
  },
  deleteCode: async ({ email }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM auth_codes
      WHERE email = $1
      RETURNING *
      `,
      [email],
    )

    return rows[0]
  },
  createUser: async ({ email, username }) => {
    const { rows } = await pool.query(
      `
      INSERT INTO users (email, username)
      VALUES ($1, $2)
      RETURNING *
      `,
      [email, username],
    )

    return rows[0]
  },
  getUserByEmail: async ({ email }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM users WHERE email = $1
      `,
      [email],
    )

    return rows[0]
  },
  getUserByUsername: async ({ username }) => {
    const { rows } = await pool.query(
      `
      SELECT * FROM users WHERE username = $1
      `,
      [username],
    )

    return rows[0]
  },
  deleteUser: async ({ id }) => {
    const { rows } = await pool.query(
      `
      DELETE FROM users WHERE id = $1 RETURNING *
      `,
      [id],
    )

    return rows[0]
  },
}
