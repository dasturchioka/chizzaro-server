const express = require('express')
const { createCourier, getAllCouriers } = require('../../controllers/admin/courier.controller')
const router = express.Router()

router.post('/create', createCourier)
router.get('/get-all', getAllCouriers)

module.exports = router
