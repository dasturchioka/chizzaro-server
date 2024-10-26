const express = require('express')
const { getAllItems, getSingleItem } = require('../../controllers/client/item.controller')
const router = express.Router()

router.get('/get-all', getAllItems)
router.get('/get-item/:id', getSingleItem)

module.exports = router
