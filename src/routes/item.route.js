const express = require('express')
const { getAllItems } = require('../controllers/item.controller')
const router = express.Router()

router.get('/get-all', getAllItems)

module.exports = router
