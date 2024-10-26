const express = require('express')
const { getItemTypes } = require('../../controllers/client/category.controller')
const router = express.Router()

router.get('/get-category-types', getItemTypes)

module.exports = router
