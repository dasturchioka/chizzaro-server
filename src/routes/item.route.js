const express = require('express')
const { getAllItems, createItem, upload, getSingleItem } = require('../controllers/item.controller')
const router = express.Router()

router.get('/get-all', getAllItems)
router.post('/create', upload.single('img'), createItem)
router.get('/get-item/:id', getSingleItem)

module.exports = router
