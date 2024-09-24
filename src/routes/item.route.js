const express = require('express')
const {
	getAllItems,
	createItem,
	upload,
	getSingleItem,
	updateItem,
	deleteItems,
} = require('../controllers/item.controller')
const router = express.Router()

router.get('/get-all', getAllItems)
router.post('/create', upload.single('img'), createItem)
router.get('/get-item/:id', getSingleItem)
router.put('/update-item/:id', upload.single('img'), updateItem)
router.delete('/delete-items', deleteItems)

module.exports = router
