require('dotenv').config()
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { verifyToken, createToken } = require('../../services/jwt.service')

const CLIENT_JWT_SIGNATURE = process.env.CLIENT_JWT_SIGNATURE
const prisma = new PrismaClient()

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function check(req, res) {
	try {
		const { id } = req.params
		const authorization = req.headers['authorization']

		if (!authorization) {
			return res.json({ status: 'bad', msg: 'Authorization topilmadi' })
		}

		const token = authorization.split(' ')[1]

		if (!token) {
			return res.json({ status: 'bad', msg: 'Token topilmadi' })
		}

		const existClient = await prisma.client.findUnique({
			where: { id },
			include: { locations: true },
		})

		if (!existClient) {
			return res.json({ status: 'bad', msg: 'Bunday id da foydalanuvchi topilmadi' })
		}

		const verifiedToken = await verifyToken(token, CLIENT_JWT_SIGNATURE)

		if (!verifiedToken) {
			return res.json({ status: 'bad', msg: 'Token yaroqsiz' })
		}

		if (verifiedToken.id !== id) {
			return res.json({ status: 'bad', msg: 'Sizga bu operatsiyani bajarish taqiqlanadi' })
		}

		const newToken = await createToken(existClient, CLIENT_JWT_SIGNATURE)

		return res.json({
			status: 'ok',
			profile: existClient,
			token: newToken,
			locations: existClient.locations,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { check }
