import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthForm from "./auth/AuthForm";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicFeed from "./public/PublicFeed"
import MyBlogs from "./private/MyBlog";
import CreateBlog from "./private/CreateBlog";
import BlogDetail from "./public/BlogDetail";
import Profile from "./public/Profile";
import EditBlog from "./private/EditBlog";
import Navbar from "./components/Navbar";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        // Refresh username from latest profile data
        if (data.user && data.user.username) {
          localStorage.setItem("username", data.user.username);
        }
        setIsAuth(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("username");
        setIsAuth(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking auth...</p>;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<PublicFeed />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/u/:authorId" element={<Profile />} />
        <Route path="/login" element={<AuthForm
          onAuth={() => setIsAuth(true)} />}
        />

        {/* PRIVATE ROUTES */}
        <Route
          path="/me"
          element={
            <ProtectedRoute isAuth={isAuth}>
              <MyBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create" element={
            <ProtectedRoute isAuth={isAuth}>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id" element={
            <ProtectedRoute isAuth={isAuth}>
              <EditBlog />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;