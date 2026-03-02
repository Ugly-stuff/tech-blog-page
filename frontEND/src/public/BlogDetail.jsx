import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { isAuthenticated } from "../utils/auth";

const API = import.meta.env.VITE_API_URL;

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`${API}/api/blogs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch blog");
      const data = await res.json();

      setBlog(data);
      setLikes(data.likes?.length || 0);

      if (isAuthenticated()) {
        const userId = localStorage.getItem("userId");
        if (data.likes?.includes(userId)) {
          setIsLiked(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Comment cannot be empty");
    if (!isAuthenticated()) return alert("Please login to comment");

    try {
      const response = await fetch(`${API}/api/blogs/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment("");
      await fetchBlog();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated()) return alert("Please login to like");

    try {
      const endpoint = isLiked ? "unlike" : "like";

      const response = await fetch(
        `${API}/api/blogs/${id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to toggle like");

      const data = await response.json();
      setLikes(data.likes);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle like");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const response = await fetch(
        `${API}/api/blogs/${id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      await fetchBlog();
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!blog) return <p className="text-center mt-10">Blog not found</p>;

  const currentUserId = localStorage.getItem("userId");

  const isVideo =
    blog?.image &&
    (blog.image.includes(".mp4") ||
      blog.image.includes(".webm") ||
      blog.image.includes(".mov") ||
      blog.mediaType === "video");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <BackButton fallback="/" />

        <h1 className="text-4xl font-bold text-[#033452] mt-4">
          {blog.title}
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          <Link
            to={`/u/${blog.authorId}`}
            className="hover:underline text-[#033452]"
          >
            {blog.authorName || "Unknown Author"}
          </Link>
          {" • "}
          {new Date(blog.createdAt).toDateString()}
        </p>

        {blog.image && (
          <div className="mt-6 mb-6 rounded-lg overflow-hidden bg-gray-200">
            {isVideo ? (
              <video
                src={`${API}${blog.image}`}
                controls
                className="w-full max-h-96 object-contain bg-black"
              />
            ) : (
              <img
                src={`${API}${blog.image}`}
                alt={blog.title}
                className="w-full h-64 object-cover"
              />
            )}
          </div>
        )}

        <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </p>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={handleLike}
            className={`text-lg cursor-pointer ${
              isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            {isLiked ? "❤️" : "🤍"} {likes} likes
          </button>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">
            Comments ({blog.comments?.length || 0})
          </h3>

          <div className="flex flex-col gap-4 mb-6">
            {blog.comments?.length > 0 ? (
              blog.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#033452]">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {currentUserId === comment.userId && (
                      <button
                        onClick={() =>
                          handleDeleteComment(comment._id)
                        }
                        className="text-sm text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="text-gray-700 mt-2">
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>

          {isAuthenticated() ? (
            <>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border rounded resize-none"
                rows="3"
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-[#033452] text-white px-4 py-2 rounded"
              >
                Post Comment
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-6">
              <Link
                to="/login"
                className="text-[#033452] hover:underline"
              >
                Login
              </Link>{" "}
              to add a comment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;