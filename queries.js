const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING, ssl: true })

const getUsers = async (_, res) => {
    const results = await pool.query(
        `SELECT id, name, email, isblocked AS status, 
        EXTRACT(EPOCH FROM registrationdate)*1000 AS regdate,
        EXTRACT(EPOCH FROM lastlogon)*1000 AS lastlogin FROM users ORDER BY ID ASC`
    )
    res.status(200).json(results.rows.map(({ password, ...result }) => result))
}

const findByEmail = async (email) => {
    const results = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    return results?.rows[0]
}

const findById = async (id) => {
    const results = await pool.query('SELECT * FROM users WHERE ID = $1', [id])
    return results?.rows[0]
}

const updateLastLogon = async (id) => {
    await pool.query("UPDATE users SET lastLogon = 'NOW()' WHERE ID = $1", [id])
}

const createUser = async (req, res) => {
    try {
        const { name = null, email } = req.body
        const results = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [
            name,
            email,
            req._passwordHash,
        ])
        const { password, ...user } = results.rows[0]
        res.status(201).json(user)
    } catch (error) {
        if (error.severity === 'ERROR' && error.constraint === 'users_email_key') {
            return res.status(400).json({ msg: 'An account with this email already exists.' })
        }
    }
}

const blockUsers = async (req, res) => {
    const ids = req.body.join(', ')
    const results = await pool.query(`UPDATE users SET isblocked = true WHERE ID IN (${ids})`)
    res.status(200).json(req.body.length === results.rowCount)
}

const unBlockUsers = async (req, res) => {
    const ids = req.body.join(', ')
    const results = await pool.query(`UPDATE users SET isblocked = false WHERE ID IN (${ids})`)
    res.status(200).json(req.body.length === results.rowCount)
}

const deleteUsers = async (req, res) => {
    const ids = req.body.join(', ')
    const results = pool.query(`DELETE FROM users WHERE ID IN (${ids})`)
    res.status(200).json(req.body.length === results.rowCount)
}

module.exports = {
    findByEmail,
    findById,
    updateLastLogon,
    getUsers,
    createUser,
    blockUsers,
    unBlockUsers,
    deleteUsers,
}
