import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


const BlogCard = ({ blog, onLikeUpdate }) => {
    const navigate = useNavigate();
    const [likeCount, setLikeCount] = useState(blog.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [liking, setLiking] = useState(false);

    const currentUserId = localStorage.getItem("userId");

    // Check if current user has already liked this blog
    useEffect(() => {
        if (currentUserId && blog.likes?.includes(currentUserId)) {
            setIsLiked(true);
        } else {
            setIsLiked(false);
        }
    }, [blog, currentUserId]);

    const openBlog = () =>{
        navigate(`/blog/${blog._id}`);
    };

    const openAuthor = (e) => {
       e.stopPropagation();
       if (blog.authorId) navigate(`/u/${blog.authorId}`);
    };

    // Detect if media is video
    const isVideo = blog.image && (
        blog.image.includes('.mp4') ||
        blog.image.includes('.webm') ||
        blog.image.includes('.mov') ||
        blog.mediaType === 'video'
    );

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setLiking(true);
        try {
            const endpoint = isLiked 
                ? `http://localhost:5000/api/blogs/${blog._id}/unlike`
                : `http://localhost:5000/api/blogs/${blog._id}/like`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to update like");
            }

            const data = await response.json();
            setLikeCount(data.likes);
            setIsLiked(!isLiked);

            // Notify parent to update the blog data
            if (onLikeUpdate) {
                onLikeUpdate(blog._id, data.likes, !isLiked);
            }
        } catch (error) {
            console.error("Error updating like:", error);
            alert("Error updating like. Please try again.");
        } finally {
            setLiking(false);
        }
    };

    return (
        <div
            onClick={openBlog}
            className='bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col h-full'
        >
            {blog.image && (
                <div className="relative w-full aspect-video bg-gray-200 overflow-hidden flex-shrink-0">
                    {isVideo ? (
                        <video
                            src={`http://localhost:5000${blog.image}`}
                            className="w-full h-full object-contain"
                            onMouseEnter={(e) => e.target.play()}
                            onMouseLeave={(e) => {
                                e.target.pause();
                                e.target.currentTime = 0;
                            }}
                        />
                    ) : (
                        <img
                            src={`http://localhost:5000${blog.image}`}
                            alt={blog.title}
                            className="w-full h-full object-contain"
                        />
                    )}
                    {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-20 transition">
                            <div className="text-4xl">▶️</div>
                        </div>
                    )}
                </div>
            )}

            <div className='p-5 flex flex-col flex-grow'>
                <h2 className='text-lg font-semibold text-[#033452] line-clamp-2'>
                    {blog.title}
                </h2>
                <p className='text-gray-600 text-sm mt-2 line-clamp-2 flex-grow'>
                    {blog.desc}
                </p>
                <div className='flex justify-between items-center mt-4 text-sm text-gray-400'>
                    <span 
                      onClick={openAuthor} 
                      className='hover:underline text-[#033452] cursor-pointer font-semibold'
                    >
                        👤 {blog.authorName || "Unknown Author"}
                    </span>
                </div>
                <div className='flex gap-6 mt-auto pt-2 text-gray-500 text-sm'>
                    <button
                        onClick={handleLikeClick}
                        disabled={liking}
                        className='hover:text-red-500 transition disabled:opacity-50 cursor-pointer flex items-center gap-1'
                    >
                        <span className={isLiked ? 'text-red-500' : ''}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                        {likeCount}
                    </button>
                    <span>💬 {blog.comments?.length || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;