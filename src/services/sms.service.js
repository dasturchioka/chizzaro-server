require('dotenv').config()
const axios = require('axios').default
const FormData = require('form-data')
const ESKIZ_SMS_API_TOKEN = process.env.ESKIZ_SMS_API_TOKEN

async function sendMessage({ phone, message }) {
	try {
		const data = new FormData()
		data.append('mobile_phone', phone)
		data.append('message', 'Bu Eskiz dan test')
		data.append('from', '4546')

		const response = await axios.post('https://notify.eskiz.uz/api/message/sms/send', data, {
			headers: { Authorization: `Bearer ${ESKIZ_SMS_API_TOKEN}`, ...data.getHeaders() },
		})

		console.log(response.data)

		if (!response || response.status >= 400) {
			return {
				status: 'bad',
				message: "Eskizga so'rov yuborilmadi",
				err: 'Bad Network',
			}
		}

		if (response.data.status !== 'waiting') {
			return {
				status: 'bad',
				message: "Eskizga so'rov yuborilmadi",
				err: 'Bad Network',
			}
		}

		if (response.data.status === 'waiting') {
			return {
				status: 'ok',
				message: "Eskizga so'rov yuborildi, sms provider kutilmoqda",
				response,
			}
		}
	} catch (error) {
		console.log(error)
		return {
			status: 'bad',
			message: error.message || 'Qandaydir xatolik yuzaga keldi',
			error,
		}
	}
}

module.exports = { sendMessage }
