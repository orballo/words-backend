import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import auth from './auth'

const app = new Koa()

app.use(bodyparser())
app.use(auth.routes())

app.listen(4000)
