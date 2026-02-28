import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/blogs/${id}`)
      .then((res) => res.json())
      .then((blog) => {
        setTitle(blog.title);
        setContent(blog.content);
      })
      .catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        navigate("/me");
      }
    } catch (err) {
      console.error("Error updating blog:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
        <div className='max-w-3xl mx-auto bg-white p-8 rounded-xl shadow'>
            <BackButton fallback="/me" />
            <h1 className='text-3xl font-bold mb-6'>Edit Blog</h1>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='border p-3 rounded'
                  required
                />
                <textarea 
                  rows={8} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className='border p-3 rounded resize-none'
                  required
                />
                <button type="submit" disabled={loading} className='bg-[#033452] text-white py-3 rounded disabled:opacity-60'>
                    {loading ? "Updating..." : "Update Blog"}
                </button>
            </form>
        </div>
    </div>
  );
};

export default EditBlog;