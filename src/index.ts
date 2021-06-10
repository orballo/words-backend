import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import auth from './auth'
import words from './words'
import tags from './tags'

const app = new Koa()

app.use(bodyparser())
app.use(auth.routes())
app.use(words.routes())
app.use(tags.routes())

app.listen(4000)
