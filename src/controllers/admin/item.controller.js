const { PrismaClient } = require('@prisma/client')
const tmp = require('tmp')
const express = require('express')
const multer = require('multer')
const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

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

const tempDir = path.join(__dirname, '../../public/temp/')

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, tempDir) // Save the original image temporarily
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
	},
})

const upload = multer({ storage })

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function createItem(req, res) {
	try {
		const { name, size, price, description, category } = req.body

		// Validation checks
		if (!name) return res.json({ status: 'bad', msg: 'Nom kiritilishi zarur' })
		if (!size) return res.json({ status: 'bad', msg: "O'lcham yoki uzunlik kiritilishi zarur" })
		if (!price) return res.json({ status: 'bad', msg: 'Narx kiritilishi zarur' })
		if (!description) return res.json({ status: 'bad', msg: "Ta'rif kiritilishi zarur" })
		if (!category) return res.json({ status: 'bad', msg: 'Kategoriya kiritilishi zarur' })
		if (!req.file) return res.status(400).json({ message: 'Rasm yuklanmadi' })

		// Check the image size
		const fileSizeInBytes = req.file.size // Get the file size in bytes
		const fileSizeInKB = fileSizeInBytes / 1024 // Convert to KB

		// Create a temp file using the tmp library
		const tempFile = tmp.fileSync({ postfix: '.png' })

		// Set the final destination for the resized image
		const finalDir = path.join(__dirname, '../../public/items/')
		const finalDestination = path.join(finalDir, req.file.filename)

		if (fileSizeInKB > 100) {
			// Check if the file size is greater than 100KB
			// Use sharp to resize, maintain transparency, and compress
			await sharp(req.file.path)
				.resize({ width: 800 })
				.webp({ quality: 70 }) // Adjust PNG compression level
				.toFile(tempFile.name) // Save resized image to the temp file
		} else {
			// If the image is already below 100KB, just copy it
			await fs.copyFile(req.file.path, tempFile.name)
		}

		// Move the temp file to the final destination
		await fs.copyFile(tempFile.name, finalDestination)

		// Remove the original file from the temporary folder
		await fs.unlink(req.file.path)

		// Remove the temp file
		await fs.unlink(tempFile.name)

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
			include: { category: true },
		})

		return res.json({ item: newItem, categoryId: newItem.categoryId })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to create item' })
	}
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function getSingleItem(req, res) {
	try {
		const { id } = req.params

		const item = await prisma.item.findUnique({ where: { id }, include: { category: true } })

		if (!item) {
			return res.json({ status: 'bad', msg: "Ma'lumot topilmadi" })
		}

		return res.json({ status: 'ok', item })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function updateItem(req, res) {
	try {
		const { name, size, price, description, category, id } = req.body

		if (req.file) {
			const itemFound = await prisma.item.findUnique({ where: { id } })

			if (itemFound.img) {
				await fs.unlink(path.join(__dirname, `../../public/${itemFound.img}`))
			}

			// Check the image size
			const fileSizeInBytes = req.file.size // Get the file size in bytes
			const fileSizeInKB = fileSizeInBytes / 1024 // Convert to KB

			// Create a temp file using the tmp library
			const tempFile = tmp.fileSync({ postfix: '.png' })

			// Set the final destination for the resized image
			const finalDir = path.join(__dirname, '../../public/items/')
			const finalDestination = path.join(finalDir, req.file.filename)

			if (fileSizeInKB > 100) {
				// Check if the file size is greater than 100KB
				// Use sharp to resize, maintain transparency, and compress
				await sharp(req.file.path)
					.resize({ width: 800 })
					.webp({ quality: 70 }) // Adjust PNG compression level
					.toFile(tempFile.name) // Save resized image to the temp file
			} else {
				// If the image is already below 100KB, just copy it
				await fs.copyFile(req.file.path, tempFile.name)
			}

			// Move the temp file to the final destination
			await fs.copyFile(tempFile.name, finalDestination)

			// Remove the original file from the temporary folder
			await fs.unlink(req.file.path)

			// Remove the temp file
			await fs.unlink(tempFile.name)

			// Get the relative path to be saved in the database
			const imgPath = `/items/${req.file.filename}`
			const updatedItem = await prisma.item.update({
				where: { id },
				data: {
					img: imgPath,
					name,
					price,
					size,
					description,
					category: { connect: { name: category } },
				},
				include: { category: true },
			})

			return res.json({
				item: updatedItem,
				categoryId: updatedItem.categoryId,
				msg: 'Mahsulot yangilandi',
			})
		}

		const updatedItem = await prisma.item.update({
			where: { id },
			data: {
				name,
				price,
				size,
				description,
				category: { connect: { name: category } },
			},
			include: { category: true },
		})

		return res.json({
			item: updatedItem,
			categoryId: updatedItem.categoryId,
			msg: 'Mahsulot yangilandi',
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to update item' })
	}
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function deleteItems(req, res) {
	try {
		const { items } = req.body

		for (let i = 0; i < items.length; i++) {
			await fs.unlink(path.join(__dirname, `../../src/public/${items[i].img}`))

			await prisma.item.delete({ where: { id: items[i].id } })
		}

		return res.json({ status: 'ok', msg: "Mahsulotlar o'chirildi" })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to update item' })
	}
}

module.exports = { getAllItems, createItem, upload, getSingleItem, updateItem, deleteItems }
