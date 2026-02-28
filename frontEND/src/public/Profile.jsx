import React, { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import BackButton from "../components/BackButton";
import { useParams } from "react-router-dom";


const Profile = () => {
    const { authorId } = useParams();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorInfo, setAuthorInfo] = useState(null);

    useEffect(() => {
        // Fetch author's blogs
        fetch(`http://localhost:5000/api/blogs/author/${authorId}`)
            .then((res) => res.json())
            .then((data) => {
                setBlogs(data);
                if (data.length > 0) {
                    setAuthorInfo({
                        name: data[0].authorName || "Unknown Author",
                        id: authorId
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            });
    }, [authorId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    const authorName = authorInfo?.name || "Unknown Author";

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                <BackButton fallback="/" />

                {/* PROFILE HEADER */}
                <div className="bg-white rounded-xl shadow p-6 mb-8 mt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#033452] to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {authorName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#033452]">
                                {authorName}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {blogs.length} {blogs.length === 1 ? "blog" : "blogs"} published
                            </p>
                        </div>
                    </div>
                </div>

                {/*BLOGS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-500">No blogs published yet.</p>
                        </div>
                    )}
                    {blogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;