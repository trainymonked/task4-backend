const jwt = require('jsonwebtoken')
const { findById } = require('../queries')

const authCheck = (req, res, next) => {
    try {
        const token = req.header('auth-token')
        if (!token) {
            return res.status(401).json({ msg: 'No authentication token, authorization denied.' })
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        } catch {
            return res.status(401).json({ msg: 'Token verification failed, authorization denied.' })
        }

        findById(decoded.id).then((user) => {
            if (!user) {
                return res.status(403).json({ msg: 'The account has been deleted.' })
            }
            req._id = user.id
            req._name = user.name
            if (user.isblocked) {
                return res.status(403).json({ msg: 'You have been blocked.' })
            }
            next()
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = authCheck
