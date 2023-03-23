const router = require('express').Router()

const authCheck = require('../midware/authCheck')

const { getUsers, blockUsers, unBlockUsers, deleteUsers } = require('../queries')

router.get('/', authCheck, getUsers)

router.patch('/block', authCheck, blockUsers)
router.patch('/unblock', authCheck, unBlockUsers)
router.delete('/', authCheck, deleteUsers)

module.exports = router
