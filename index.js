const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

app.listen(PORT)

app.use('/auth', require('./routes/authRouter'))
app.use('/users', require('./routes/usersRouter'))
