const { Telegraf } = require('telegraf')

async function initializeBot() {
	try {
		// Load environment variables (Telegram bot token, server URL, etc.)
		const bot = new Telegraf(process.env.BOT_TOKEN)
		const socket = global.io

		const webAppUrl = process.env.WEBAPP_URL

		bot.start(ctx => {
			ctx.reply('👋🏻 Assalomu alaykum! Buyurtma berish uchun pastdagi tugmani bosing 👇🏻', {
				reply_markup: {
					inline_keyboard: [[{ text: 'Interaktiv menu 🍕', web_app: { url: webAppUrl } }]],
				},
			})
		})

		socket.on('order:created-no-confirmation', async data => {})

		// Listen to incoming Socket.IO messages (for courier app updates)
		socket.on('orderUpdate', data => {
			console.log('Order update received:', data)
		})

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
