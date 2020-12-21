const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

let firstUser
let firstUserToken

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()

    const initialUsers = await helper.usersInDb()
    firstUser = initialUsers[0]

    const tokenRes = await api
        .post('/api/login')
        .send({
            username: 'root',
            password: 'sekret'
        })

    firstUserToken = tokenRes.body.token

    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))

    const promiseArray = blogObjects.map(blog => {
        blog.userId = firstUser.id
        blog.save()
    })
    await Promise.all(promiseArray)
})

const api = supertest(app)

describe('getting blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('id to be defined', async () => {
        const response = await api.get('/api/blogs')
        for (let blog of response.body) {
            expect(blog.id).toBeDefined()
        }
    })
})

describe('adding a new blog', () => {
    test('length of blogs increased after posting', async () => {
        const newBlog = {
            title: 'Blog4',
            author: 'Author4',
            url: 'blog4.com',
            likes: 4,
            userId: firstUser.id
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + firstUserToken)
            .send(newBlog)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    })

    test('if the likes property is missing from the request, it will default to the value 0', async () => {
        const newBlog = {
            title: 'Blog5',
            author: 'Author5',
            url: 'blog5.com',
            userId: firstUser.id
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + firstUserToken)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')

        expect(response.body.find(blog => blog.title === 'Blog5').likes).toBe(0)
    })

    test('missing title and url', async () => {
        const newBlog = {
            author: 'Author6',
            id: 6,
            userId: firstUser.id
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + firstUserToken)
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('missing token', async () => {
        const newBlog = {
            title: 'Blog7',
            author: 'Author7',
            url: 'blog7.com',
            userId: firstUser.id
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.map(r => r.title)).not.toContain(newBlog.title)
    })
})

describe('deleting a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', 'bearer ' + firstUserToken)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

        const contents = blogsAtEnd.map(r => r.title)

        expect(contents).not.toContain(blogToDelete.title)
    })
})

describe('updating a blog', () => {
    test('update all fields of a blog', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const infoForUpdate = {
            title: 'BlogX',
            author: 'AuthorX',
            url: 'blogX.com',
            likes: 10
        }

        const updatedBlog = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(infoForUpdate)
            .expect('Content-Type', /application\/json/)

        expect(updatedBlog.body).toEqual({
            ...infoForUpdate,
            id: blogToUpdate.id
        })
    })

    test('update likes of a blog', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const infoForUpdate = {
            likes: 99
        }

        const updatedBlog = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(infoForUpdate)
            .expect('Content-Type', /application\/json/)

        expect(updatedBlog.body).toEqual({
            ...blogToUpdate,
            likes: 99
        })
    })
})

describe('when there is initially one user in db', () => {
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username is not sent', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'user2',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password is not sent', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'user3',
            name: 'Superuser'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`password` is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'user4',
            name: 'Superuser',
            password: '12'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`password` must be more than 2 characters long')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})


afterAll(() => {
    mongoose.connection.close()
})