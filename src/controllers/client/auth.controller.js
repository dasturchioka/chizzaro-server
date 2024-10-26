require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { createToken } = require('../../services/jwt.service')
const { sendMessage } = require('../../services/sms.service')
const { Request, Response } = require('express')
const { generateCode } = require('../../services/confirmation.service')

const CLIENT_JWT_SIGNATURE = process.env.CLIENT_JWT_SIGNATURE

const prisma = new PrismaClient()

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function login(req, res) {
	try {
		const { phone, fullname } = req.body

		const existClient = await prisma.client.findUnique({ where: { phone } })

		if (!existClient) {
			const newCode = await generateCode()
			await prisma.client.create({
				data: {
					phone,
					fullname,
					confirmation: { confirmed: false, code: newCode },
				},
			})

			const resultSms = await sendMessage({
				phone,
				message: `Chizzaro pizza telegram boti uchun tasdiqlash kodingiz: ${newCode}`,
			})

			if (resultSms.status !== 'ok') {
				return res.json({
					status: 'bad',
					msg: "Tasdiqlash kodini yuborishda xatolik yuzaga keldi, boshqatdan urinib ko'ring",
					resultSms,
				})
			}

			return res.json({ status: 'ok', msg: 'Tasdiqlash kodi yuborildi' })
		}

		if (!existClient.confirmation.confirmed) {
			const resultSms = await sendMessage({
				phone,
				message: `Chizzaro pizza telegram boti uchun tasdiqlash kodingiz: ${existClient.confirmation.code}`,
			})

			if (resultSms.status !== 'ok') {
				return res.json({
					status: 'bad',
					msg: "Tasdiqlash kodini yuborishda xatolik yuzaga keldi, boshqatdan urinib ko'ring",
					resultSms,
				})
			}

			return res.json({ status: 'ok', msg: 'Tasdiqlash kodi yuborildi' })
		}

		const newToken = await createToken(existClient, CLIENT_JWT_SIGNATURE)

		return res.json({ status: 'ok', msg: 'Tizimga kirildi', token: newToken })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { login }