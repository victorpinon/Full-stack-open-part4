const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogList) => {
    return blogList.reduce((sum, curr) => (sum + curr.likes), 0)
}

const favoriteBlog = (blogList) => {
    const favoriteBlog = blogList.reduce((fav, curr) => (fav.likes < curr.likes ? curr : fav))
    return {
        title: favoriteBlog.title,
        author: favoriteBlog.author,
        likes: favoriteBlog.likes
    }
}

const mostBlogs = (blogList) => {
    let authorAndBlogsList = []
    for (let blog of blogList) {
        let authorAndBlogs = authorAndBlogsList.find(author => author.author === blog.author)
        if (authorAndBlogs === undefined) {
            authorAndBlogsList.push({
                author: blog.author,
                blogs: 1
            })
        }
        else {
            authorAndBlogs.blogs++
        }
    }
    return authorAndBlogsList.reduce((mostBlogs, curr) => (mostBlogs.blogs < curr.blogs ? curr : mostBlogs))
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}