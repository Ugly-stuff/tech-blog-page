import React, { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";

const API = import.meta.env.VITE_API_URL;

const PublicFeed = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API}/api/blogs`);

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  const handleLikeUpdate = (blogId, newLikeCount, isNowLiked) => {
    const currentUserId = localStorage.getItem("userId");

    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId
          ? {
              ...blog,
              likes: isNowLiked
                ? [...(blog.likes || []), currentUserId]
                : (blog.likes || []).filter(
                    (id) => id !== currentUserId
                  ),
            }
          : blog
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#033452] mb-8">
          Latest Blogs
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>

        {blogs.length === 0 && (
          <p className="text-gray-500 mt-10">
            No blogs yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicFeed;