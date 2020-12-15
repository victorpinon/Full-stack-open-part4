const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogList) => {
    return blogList.reduce((sum, curr) => (sum + curr.likes), 0)
}

module.exports = {
    dummy,
    totalLikes
}