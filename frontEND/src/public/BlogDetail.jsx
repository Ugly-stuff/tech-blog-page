import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { isAuthenticated } from "../utils/auth";

const BlogDetail = () => {
  
  const  { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/blogs/${id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch blog: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Blog data:", data);
      console.log("Likes array:", data.likes);
      console.log("Comments array:", data.comments);
      
      setBlog(data);
      setLikes(data.likes?.length || 0);
      
      // Check if current user liked this blog
      if (isAuthenticated()) {
        const userId = localStorage.getItem("userId");
        console.log("Current user ID:", userId);
        console.log("Is user in likes?", data.likes?.includes(userId));
        if (data.likes?.includes(userId)) {
          setIsLiked(true);
        }
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching blog:", err);
      setLoading(false);
    });
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    if (!isAuthenticated()) {
      alert("Please login to comment");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await response.json();
      console.log("Comment response:", data);

      if (response.ok) {
        setNewComment("");
        alert("Comment added successfully!");
        // Refresh blog data
        fetch(`http://localhost:5000/api/blogs/${id}`)
          .then((res) => res.json())
          .then((updatedBlog) => {
            console.log("Blog updated after comment:", updatedBlog);
            setBlog(updatedBlog);
          })
          .catch(console.error);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert("Please login to like");
      return;
    }

    try {
      const endpoint = isLiked ? "unlike" : "like";
      const response = await fetch(`http://localhost:5000/api/blogs/${id}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log(`${endpoint} response:`, data);

      if (response.ok) {
        setLikes(data.likes);
        setIsLiked(!isLiked);
        console.log(`${endpoint} successful`);
      } else {
        console.error(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to toggle like");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("Delete comment response:", data);

      if (response.ok) {
        alert("Comment deleted!");
        // Refresh blog data
        fetch(`http://localhost:5000/api/blogs/${id}`)
          .then((res) => res.json())
          .then((updatedBlog) => {
            console.log("Blog updated after delete:", updatedBlog);
            setBlog(updatedBlog);
          })
          .catch(console.error);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!blog) {
    return <p className="text-center mt-10">Blog not found</p>;
  }

  const currentUserId = localStorage.getItem("userId");

  // Detect if media is video
  const isVideo = blog && blog.image && (
    blog.image.includes('.mp4') ||
    blog.image.includes('.webm') ||
    blog.image.includes('.mov') ||
    blog.mediaType === 'video'
  );

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
                src={`http://localhost:5000${blog.image}`}
                controls
                className="w-full max-h-96 object-contain bg-black"
                style={{ aspectRatio: '16/9' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={`http://localhost:5000${blog.image}`} 
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
            className={`text-lg cursor-pointer transition ${
              isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            {isLiked ? "❤️" : "🤍"} {likes} likes
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Comments ({blog.comments?.length || 0})</h3>

          {/* Comment List */}
          <div className="flex flex-col gap-4 mb-6">
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-[#033452]">{comment.userName}</p>
                      <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                    {currentUserId === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-2">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>

          {/* Add Comment */}
          {isAuthenticated() ? (
            <div className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border rounded resize-none"
                rows="3"
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-[#033452] text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-[#033452] hover:underline">Login</Link> to add a comment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
