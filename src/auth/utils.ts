import { generate } from 'generate-password'
import jwt from 'jsonwebtoken'

export const generateCode = () =>
  generate({
    length: 10,
    numbers: true,
    lowercase: false,
  })

export const generateToken = (payload: any) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '365d',
  })

export const verifyToken = (token: any) =>
  jwt.verify(token, process.env.TOKEN_SECRET)
