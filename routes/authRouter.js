const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authCheck = require('../midware/authCheck')

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ msg: 'Not all fields have been entered.' })
    }

    // const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: 'An account with this email already exists.' })
    }

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    // const newUser = new User({
    //   email: email,
    //   password: passwordHash
    // })

    // const savedUser = await newUser.save()

    res.json(savedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ msg: 'Not all fields have been entered.' })
    }
  
    // const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: 'No account with this email has been registered.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN)

    res.json({
      token: token,
      user: {
        id: user._id
      }
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

    // const user = await User.findById(decoded.id)
    if (!user) {
      return res.json(false)
    }

    res.json(true)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', authCheck, async (req, res) => {
  res.json({
    id: req._id
  })
})

module.exports = router
