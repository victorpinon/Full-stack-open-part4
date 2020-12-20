const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
require('express-async-errors')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const body = request.body

    if (body.password === undefined) {
        response.status(400).json({ error: 'User validation failed: password: Path `password` is required.' })
    }
    else if (body.password.length < 3) {
        response.status(400).json({ error: 'Password validation failed: password. `password` must be more than 2 characters long.' })
    }
    else {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash,
        })

        const savedUser = await user.save()

        response.json(savedUser)
    }
})

module.exports = usersRouter