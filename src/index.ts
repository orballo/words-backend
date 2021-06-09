import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import auth from './auth'
import words from './words'

const app = new Koa()

app.use(bodyparser())
app.use(auth.routes())
app.use(words.routes())

app.listen(4000)
