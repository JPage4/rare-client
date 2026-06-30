import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { searchPosts } from "../../managers/PostManager"

export const PostSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const query = searchParams.get("q") || ""
  const author = searchParams.get("author") || ""
  const titleRef = useRef()
  const authorRef = useRef()

  useEffect(() => {
    if (query || author) {
      searchPosts(query, author).then(setPosts)
    } else {
      setPosts([])
    }
  }, [query, author])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (titleRef.current.value.trim()) params.set("q", titleRef.current.value.trim())
    if (authorRef.current.value.trim()) params.set("author", authorRef.current.value.trim())
    setSearchParams(params)
  }

  return (
    <div className="container mt-4">
      <h2 className="title is-4">Search Results</h2>
      <form onSubmit={handleSearch} className="is-flex mb-4">
        <input
          className="input mr-1"
          type="text"
          placeholder="Title..."
          defaultValue={query}
          ref={titleRef}
        />
        <input
          className="input mr-1"
          type="text"
          placeholder="Author..."
          defaultValue={author}
          ref={authorRef}
        />
        <button type="submit" className="button is-outlined">Search</button>
      </form>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td><Link to={`/posts/${post.id}`}>{post.title}</Link></td>
                <td>{post.user.username}</td>
                <td>{post.publication_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}