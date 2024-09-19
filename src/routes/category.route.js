const express = require('express')
const { createCategory, getItemTypes } = require('../controllers/category.controller')
const router = express.Router()

router.post('/create', createCategory)
router.get('/get-category-types', getItemTypes)

module.exports = router
