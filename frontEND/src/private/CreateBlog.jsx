import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import FileUpload from "../components/FileUpload";

const CreateBlog = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState(""); // 'image' or 'video'
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileSelect = (file) => {
    if (file) {
      setMediaFile(file);
      setUploadingFile(true);

      // Detect media type
      if (file.type.startsWith('image/')) {
        setMediaType('image');
        // Create preview for images
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaPreview(e.target.result);
          setUploadingFile(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
        // Create preview for videos (thumbnail)
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaPreview(e.target.result);
          setUploadingFile(false);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadingFile(false);
      }
    } else {
      setMediaFile(null);
      setMediaPreview("");
      setMediaType("");
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data.fileUrl; // Return the URL of the uploaded file
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let mediaUrl = '';

      // Upload file to server if selected
      if (mediaFile) {
        mediaUrl = await uploadFile(mediaFile);
      }

      // Create blog with media URL
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          desc: content.slice(0, 120),
          content,
          image: mediaUrl, // Now this is a URL instead of Base64
          mediaType: mediaType, // Store the media type
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create blog");
      }

      alert('Blog published successfully!');
      navigate("/me");
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <BackButton fallback="/me" />
        <h1 className="text-3xl font-bold text-[#033452] mb-6">
          Create New Blog
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 Blog Media (Drag & Drop or Click)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload images, videos, or other media files (Max 100MB)
            </p>
            <FileUpload 
              onFileSelect={handleFileSelect}
              accept="image/*,video/*"
            />
          </div>

          <textarea
            placeholder="Write your blog content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            className="border p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading || uploadingFile || !title || !content}
            className="bg-[#033452] text-white py-3 rounded disabled:opacity-60 hover:bg-opacity-90 transition"
          >
            {loading ? "Publishing..." : (uploadingFile ? "Processing..." : "Publish Blog")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
