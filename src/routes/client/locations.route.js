const express = require('express')
const { getLocations } = require('../../controllers/client/locations.controller')
const router = express.Router()

router.get('get-locations/:id', getLocations)

module.exports = router
