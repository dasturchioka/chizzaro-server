const { PrismaClient, ItemType } = require('@prisma/client')

const prisma = new PrismaClient()

async function getItemTypes(req, res) {
	try {
		const allTypes = Object.values(ItemType)

		if (!allTypes.length) {
			return res.json({ status: 'bad', msg: 'Categoriyalar topilmadi' })
		}

		const allCategories = await prisma.category.findMany()

		const newTypes = []

		for (let i = 0; i < allTypes.length; i++) {
			const type = allTypes[i]
			const category = allCategories.find(category => category.name === type)

			if (!category) {
				newTypes.push({ name: type, isOnTheBase: false, id: '' })
			} else {
				newTypes.push({ name: type, isOnTheBase: true, id: category.id })
			}
		}

		return res.json({ categories: newTypes })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { getItemTypes }
