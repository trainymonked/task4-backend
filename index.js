const express = require('express')
require('dotenv').config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 8000

app.listen(PORT)

app.use('/auth', require('./routes/authRouter'))
app.use('/users', require('./routes/usersRouter'))
