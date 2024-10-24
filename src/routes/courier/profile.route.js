const express = require('express')
const { getProfile } = require('../../controllers/courier/profile.controller')
const router = express.Router()

router.get('/get-profile/:login', getProfile)

module.exports = router
