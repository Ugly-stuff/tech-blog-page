import React, { useEffect, useState } from 'react'
import BlogCard from '../components/BlogCard';

const PublicFeed = () => {

  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then((res) => res.json())
      .then(setBlogs);
  }, []);

  const handleLikeUpdate = (blogId, newLikeCount, isNowLiked) => {
    const currentUserId = localStorage.getItem("userId");
    
    setBlogs(blogs.map(blog =>
      blog._id === blogId
        ? {
            ...blog,
            likes: isNowLiked
              ? [...(blog.likes || []), currentUserId]
              : (blog.likes || []).filter(id => id !== currentUserId)
          }
        : blog
    ));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* HEADER */}
      <div className='max-w-6xl mx-auto px-6 py-10'>

        <h1 className='text-3xl font-bold text-[#033452] mb-8'>
          Latest Blogs
        </h1>

        {/* BLOG FEED */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {blogs.map((blog) => (
            <BlogCard 
              key={blog._id} 
              blog={blog}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
        {blogs.length === 0 && (
          <p className='text-gray-500 mt-10'> No blogs yet.</p>
        )}
      </div>
    </div>
  );
};

export default PublicFeed;