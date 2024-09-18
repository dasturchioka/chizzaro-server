require('dotenv').config()
const http = require('http')
const express = require('express')
const { Server } = require('socket.io')
const path = require('path')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
global.io = io

app.use(express.json())
app.use(express.static(__dirname + path.join('/public')))
app.use(cors({ origin: '*' }))

app.get('/', (req, res) => {
	return res.json({ msg: 'Hello motherfucker' })
})

app.use('/api/v1/items', require('./routes/item.route'))

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running on port ${process.env.PORT || 3000}`)
})

require('./bot.js').initializeBot()
