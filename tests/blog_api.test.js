const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'Blog1',
        author: 'Author1',
        url: 'blog1.com',
        likes: 1
    },
    {
        title: 'Blog2',
        author: 'Author2',
        url: 'blog2.com',
        likes: 2
    },
    {
        title: 'Blog3',
        author: 'Author3',
        url: 'blog3.com',
        likes: 3
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

const api = supertest(app)

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})

afterAll(() => {
    mongoose.connection.close()
})