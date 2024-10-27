const express = require('express')
const { login, confirmLogin } = require('../../controllers/client/auth.controller')
const router = express.Router()

router.post('/login', login)
router.post('/confirm-login', confirmLogin)

module.exports = router
