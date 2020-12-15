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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}