require('dotenv').config()
const https = require('https')
const express = require('express')
const { Server } = require('socket.io')
const path = require('path')
const fs = require('fs-extra')
const cors = require('cors')

const keyPath = path.join(__dirname, '../localhost-key.pem')
const certPath = path.join(__dirname, '../localhost.pem')

const sslOptions = {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(certPath),
}

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())

console.log(allowedOrigins);

const app = express()
const server = https.createServer(sslOptions, app)
const io = new Server(server, {
	cors: {
		origin: allowedOrigins,
	},
})
global.io = io

app.options('*', cors()) // Preflight requests
app.use(express.json())
app.use(express.static(__dirname + path.join('/public')))
app.use(
	cors({
		origin: allowedOrigins,
	})
)

app.get('/', (req, res) => {
	return res.json({ msg: 'Hello world' })
})
	
app.use('/api/v1/items', require('./routes/item.route'))
app.use('/api/v1/category', require('./routes/category.route'))

// Make sure to use server.listen instead of app.listen
server.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running on port ${process.env.PORT || 3000}`)
})

require('./bot.js').initializeBot()
