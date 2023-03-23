const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authCheck = require('../midware/authCheck')
const { checkExistingEmail, createUser, updateLastLogon, findById } = require('../queries')

router.post(
    '/signup',
    async (req, res, next) => {
        try {
            const { email, password } = req.body
            if (!email || !password) return res.status(400).json({ msg: 'Not all fields have been entered.' })

            if (await checkExistingEmail(email))
                return res.status(400).json({ msg: 'An account with this email already exists.' })

            const salt = await bcrypt.genSalt()
            req._passwordHash = await bcrypt.hash(password, salt)
            next()
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    },
    createUser
)

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ msg: 'Not all fields have been entered.' })
        }

        const user = await checkExistingEmail(email)
        if (!user) {
            return res.status(400).json({ msg: 'No account with this email has been registered.' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' })
        }

        if (user.isblocked) {
            return res.status(403).json({ msg: 'The user is blocked.' })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_TOKEN)

        await updateLastLogon(user.id)

        res.json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
            },
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/token', async (req, res) => {
    try {
        const token = req.header('auth-token')
        if (!token) {
            return res.json(false)
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        } catch {
            return res.json(false)
        }

        const user = await findById(decoded.id)
        if (!user || user.isblocked) {
            return res.json(false)
        }

        res.json(true)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/', authCheck, async (req, res) => {
    res.json({
        id: req._id,
        name: req._name,
    })
})

module.exports = router
