const express = require('express')
const Blog = require('../models/blog.js')
require('express-async-errors')

const blogsRouter = express.Router()

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    if (request.body.title === undefined && request.body.url === undefined) {
        response.status(400).end()
    }
    else {
        const blog = new Blog(request.body)
        const result = await blog.save()
        response.status(201).json(result)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter