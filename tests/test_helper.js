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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}