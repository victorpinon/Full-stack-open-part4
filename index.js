import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import http from 'http'

const server = http.createServer(app)

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})