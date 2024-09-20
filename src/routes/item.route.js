const express = require('express')
const { getAllItems, createItem, upload } = require('../controllers/item.controller')
const router = express.Router()

router.get('/get-all', getAllItems)
router.post('/create', upload.single("img"), createItem)

module.exports = router
