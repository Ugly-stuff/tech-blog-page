import React from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const CommentList = () => {
  const navigate = useNavigate();
  
  const comments = [
    { id: 1, user: "Rahul", text: "Very helpful blog!" },
    { id: 2, user: "Anita", text: "Clear explanation, thanks." },
  ];
  
  const handleFocus = () =>{
    if (!isAuthenticated()) navigate("/login");
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-100 p-4 rounded-lg"
          >
            <p className="text-sm font-semibold">{c.user}</p>
            <p className="text-gray-600">{c.text}</p>
          </div>
        ))}
      </div>
        <textarea
        onFocus={handleFocus}
        placeholder="Add a comment..."
        className="w-full mt-6 p-3 border rounded resize-none"
        />
      {/* Disabled input (public view) */}
      <div className="mt-6 text-sm text-gray-400">
        Login to add a comment
      </div>
    </div>
  );
};

export default CommentList;
