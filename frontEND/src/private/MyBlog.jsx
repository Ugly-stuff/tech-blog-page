import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "../components/BackButton";

const MyBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    navigate("/login");
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/blogs/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setBlogs(blogs.filter((b) => b._id !== blogId));
        alert("Blog deleted successfully");
      } else {
        alert("Failed to delete blog");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Error deleting blog");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading your blogs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <BackButton fallback="/" />
        
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-4xl font-bold text-[#033452]">My Blogs</h1>

          <div className="flex gap-3">
            <Link
              to="/create"
              className="px-4 py-2 bg-[#033452] text-white rounded text-sm hover:bg-opacity-90 transition"
            >
              + Create Blog
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 border border-red-500 text-red-500 rounded text-sm hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {blogs.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <p className="text-gray-500 mb-4">
                No blogs yet. Create your first one!
              </p>
              <Link
                to="/create"
                className="px-4 py-2 bg-[#033452] text-white rounded inline-block hover:bg-opacity-90 transition"
              >
                Create New Blog
              </Link>
            </div>
          )}

          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#033452]">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{blog.desc}</p>
                  <p className="text-sm text-gray-400 mt-3">
                    {new Date(blog.createdAt).toDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ❤️ {blog.likes?.length || 0} likes • 💬 {blog.comments?.length || 0} comments
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/edit/${blog._id}`}
                    className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBlogs;
