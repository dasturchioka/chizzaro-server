const { PrismaClient } = require('@prisma/client')
const express = require('express')

const prisma = new PrismaClient()

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getAllItems(req, res) {
	try {
		const allItems = await prisma.category.findMany({
			include: { items: { include: { category: true } }, _count: true },
		})

		return res.json({ items: allItems })
	} catch (error) {
		console.log(error)
		return res.json(error)
	}
}

async function getSingleItem(req, res) {
	try {
		const { id } = req.params

		const item = await prisma.item.findUnique({
			where: { id },
			include: { category: true },
		})

		if (!item) {
			return res.json({ status: 'bad', msg: "Ma'lumot topilmadi" })
		}

		return res.json({ status: 'ok', item })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = {
	getAllItems,
	getSingleItem,
}
