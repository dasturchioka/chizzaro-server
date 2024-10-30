const express = require('express')
const { check } = require('../../controllers/client/profile.controller')
const router = express.Router()

router.get('/check/:id', check)

module.exports = router
