import { Hono } from 'hono'
import { healthRoute } from './routes/health'

const app = new Hono().basePath('/api')

app.route('/health', healthRoute)

export default app
