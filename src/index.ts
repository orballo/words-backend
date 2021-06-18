import Koa from 'koa'
import cors from '@koa/cors'
import bodyparser from 'koa-bodyparser'
import auth from './auth'
import db from './db'
import { words, tags } from './routes'

db.init()

const app = new Koa()

app.use(cors({ credentials: true }))
app.use(bodyparser())
app.use(auth.routes())
app.use(words.routes())
app.use(tags.routes())

app.listen(4000)
