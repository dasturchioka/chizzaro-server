const { Telegraf } = require('telegraf')
const express = require("express")

const app = express()

async function initializeBot() {
	try {
		// Load environment variables (Telegram bot token, server URL, etc.)
		const bot = new Telegraf(process.env.BOT_TOKEN)
		const socket = app.get("socket")
		console.log(socket)

		const webAppUrl = process.env.WEBAPP_URL

		bot.start(ctx => {
			const id = ctx.from.id
			console.log(id)
			ctx.reply('👋🏻 Assalomu alaykum! Buyurtma berish uchun pastdagi tugmani bosing 👇🏻', {
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Interaktiv menu 🍕', web_app: { url: `${webAppUrl}/menu/${id}` } }],
					],
				},
			})
		})

		// socket.on('order:creating', async data => {
		// 	const user = data.user
		// 	const items = data.items

		// 	console.log(user)
		// 	console.log(items)
		// 	bot.telegram.sendMessage(user.telegramId, 'Share your location', {
		// 		reply_markup: {
		// 			inline_keyboard: [[{ text: 'Share Location', request_location: true }]],
		// 		},
		// 	})

		// 	socket.emit('message:order-creating-confirmed', { status: 'ok' })
		// })

		// // Listen to incoming Socket.IO messages (for courier app updates)
		// socket.on('order:update', data => {
		// 	console.log('Order update received:', data)
		// })

		// Start the bot
		bot.launch()
		console.log('Bot launched')
	} catch (error) {
		console.log('Error at initiliazing the bot: ', error)
	} finally {
		console.log('Bot launch execution finished')
	}
}

module.exports = { initializeBot }
