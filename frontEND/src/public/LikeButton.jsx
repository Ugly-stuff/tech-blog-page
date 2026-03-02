import React, { useState } from "react";
import { isAuthenticated } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const LikeButton = ({ blogId, initialCount = 0, onLikeChange }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Try like first
      let response = await fetch(
        `${API}/api/blogs/${blogId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If already liked → backend may return 400 → then try unlike
      if (!response.ok && response.status === 400) {
        response = await fetch(
          `${API}/api/blogs/${blogId}/unlike`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.ok) {
        const data = await response.json();
        if (onLikeChange) {
          onLikeChange(data.likes);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="text-sm text-gray-600 hover:text-red-500 transition disabled:opacity-50"
    >
      ❤️ {initialCount}
    </button>
  );
};

export default LikeButton;