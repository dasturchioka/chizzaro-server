require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { createToken } = require('../../services/jwt.service')
const express = require('express')

const COURIER_JWT_SIGNATURE = process.env.COURIER_JWT_SIGNATURE

const prisma = new PrismaClient()

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function getProfile(req, res) {
	try {
		const { login } = req.params

		const existCourier = await prisma.courier.findUnique({ where: { login } })

		if (!existCourier) {
			return res.json({ status: 'bad', msg: "Bu login bo'yicha kuryer ma'lumotlari topilmadi" })
		}

		const newToken = await createToken(existCourier, COURIER_JWT_SIGNATURE)

		return res.json({
			status: 'ok',
			msg: 'Akkaunt topildi',
			profile: existCourier,
			login,
			token: newToken,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { getProfile }
