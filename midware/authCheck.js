const jwt = require('jsonwebtoken')

const authCheck = (req, res, next) => {
  try {
    const token = req.header('auth-token')
    if (!token) {
      return res
        .status(401)
        .json({ msg: 'No authentication token, authorization denied.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    } catch {
      return res
        .status(401)
        .json({ msg: 'Token verification failed, authorization denied.' })
    }

    // User.findById(decoded.id, (err, user) => {
    //   if (err) {
    //     return res
    //       .status(401)
    //       .json({ msg: 'Invalid token, authorization denied.' })
    //   }
    //   req._id = user._id
    //   next()
    // })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = authCheck
