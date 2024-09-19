const { PrismaClient } = require('@prisma/client')
const express = require('express')
const multer = require('multer')
const fs = require('fs')

const prisma = new PrismaClient()

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getAllItems(req, res) {
	try {
		const allItems = await prisma.category.findMany({ include: { items: true, _count: true } })

		return res.json({ items: allItems })
	} catch (error) {
		console.log(error)
		return res.json(error)
	}
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'temp/') // Save the original image temporarily
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
	},
})

const upload = multer({ storage })

async function createItem(req, res) {
	try {
		const { name, size, price, description, category } = req.body

		if (!name) {
			return res.json({ status: 'bad', msg: 'Nom kiritilishi zarur' })
		}

		if (!size) {
			return res.json({ status: 'bad', msg: "O'lcham yoki uzunlik kiritilishi zarur" })
		}

		if (!price) {
			return res.json({ status: 'bad', msg: 'Narx kiritilishi zarur' })
		}

		if (!description) {
			return res.json({ status: 'bad', msg: "Ta'rif kiritilishi zarur" })
		}

		if (!category) {
			return res.json({ status: 'bad', msg: 'Kategoriya kiritilishi zarur' })
		}

		if (!req.file) {
			return res.status(400).json({ message: 'Rasm yuklanmadi' })
		}

		// Set the final destination for the resized image
		const finalDestination = path.join(__dirname, '../../public/items/', req.file.filename)

		// Use sharp to resize and compress the image
		await sharp(req.file.path)
			.resize({ width: 800 }) // Set desired width (you can adjust this)
			.jpeg({ quality: 85 }) // Adjust quality (80% keeps good quality)
			.toFile(finalDestination) // Save the resized image to 'public/items/'

		// Remove the original uploaded image in the temp folder
		fs.unlinkSync(req.file.path)

		// Get the relative path to be saved in the database
		const imgPath = `/items/${req.file.filename}`

		// Create a new item in Prisma with the image path
		const newItem = await prisma.item.create({
			data: {
				img: imgPath,
				name,
				price,
				size,
				description,
				category: { connect: { name: category } },
			},
		})

		return res.json(newItem)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to create item' })
	}
}

module.exports = { getAllItems, createItem, upload }
