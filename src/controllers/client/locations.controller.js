require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Request, Response } = require('express')

const prisma = new PrismaClient()

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function getLocations(req, res) {
	try {
		const { id } = req.params.id

		const existClient = await prisma.client.findUnique({
			where: { id },
			include: { locations: true },
		})

		if (!existClient) {
			return res.json({ status: 'bad', msg: 'Client not found' })
		}

		return res.json({ status: 'ok', locations: existClient.locations })
	} catch (error) {
    console.log(error);
    return res.status(500).json(error)
  }
}

module.exports = { getLocations }