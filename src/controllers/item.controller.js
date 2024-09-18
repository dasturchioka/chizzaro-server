const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getAllItems(req, res) {
	try {
		const allItems = await prisma.category.findMany({ include: { items: true, _count: true } })

		return res.json({ items: allItems })
	} catch (error) {
		console.log(error)
		return res.json(error)
	}
}

module.exports = { getAllItems }
