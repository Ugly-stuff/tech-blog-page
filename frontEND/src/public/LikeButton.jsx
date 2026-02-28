import React, { useState } from "react";
import { isAuthenticated } from "../utils/auth";
import { useNavigate } from "react-router-dom";

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
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (onLikeChange) {
                    onLikeChange(data.likes);
                }
            } else if (response.status === 400) {
                // Already liked, try to unlike
                const unlikeRes = await fetch(`http://localhost:5000/api/blogs/${blogId}/unlike`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (unlikeRes.ok) {
                    const data = await unlikeRes.json();
                    if (onLikeChange) {
                        onLikeChange(data.likes);
                    }
                }
            }
        } catch (err) {
            console.error("Error liking:", err);
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