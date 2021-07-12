import https from 'https'
import fs from 'fs'
import path from 'path'
import Koa from 'koa'
import cors from '@koa/cors'
import bodyparser from 'koa-bodyparser'
import * as auth from './auth'
import db from './db'
import { words, tags } from './routes'
;(async () => {
  await auth.db.init()
  await db.init()
})()

const app = new Koa()

const certs = {
  key: fs.readFileSync(
    path.resolve(process.cwd(), './words.local-key.pem'),
    'utf8',
  ),
  cert: fs.readFileSync(
    path.resolve(process.cwd(), './words.local.pem'),
    'utf8',
  ),
}

const server = https.createServer(certs, app.callback())

app.use(cors({ credentials: true }))
app.use(bodyparser())
app.use((ctx, next) => {
  ctx.cookies.secure = true
  return next()
})
app.use(auth.routes())
app.use(words.routes())
app.use(tags.routes())

server.listen(process.env.PORT || 4000)
