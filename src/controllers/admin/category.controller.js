const { PrismaClient, ItemType } = require('@prisma/client')

const prisma = new PrismaClient()

async function createCategory(req, res) {
	try {
		const categoryName = req.body.name

		const categoryExists = await prisma.category.findUnique({ where: { name: categoryName } })

		if (categoryExists) {
			return res.json({ status: 'bad', msg: 'Bu kategoriya allaqachon bor' })
		}

		const allTypes = Object.values(ItemType)

		if (!allTypes.length) {
			return res.json({ status: 'bad', msg: 'Categoriyalar topilmadi' })
		}

		const newCategory = await prisma.category.create({
			data: { name: categoryName },
			include: { items: true },
		})

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

		return res.json({
			category: newCategory,
			categoryTypes: newTypes,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

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

async function deleteCategory(req, res) {
	try {
		const { id } = req.params

		await prisma.item.deleteMany({ where: { categoryId: id } })
		await prisma.category.delete({ where: { id } })

		return res.json({ msg: "Kategoriya va undagi barcha mahsulotlar o'chirildi" })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { createCategory, getItemTypes, deleteCategory }
