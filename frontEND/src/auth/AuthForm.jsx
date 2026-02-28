import React, { useState, useEffect } from 'react'
import Blog from '../private/MyBlog';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ onAuth }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmEmail, setConfirmEmail] = useState("");

  const googleLogin = async () => {

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      //Firebase ID Token Taking
      const idToken = await result.user.getIdToken();
      //backendCall
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      const data = await res.json();
      if (data.status === "ok") {
        //Storing backend JWT and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username || data.email.split('@')[0]);
        onAuth();
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error)
      alert("Google login failed");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isLogin && email !== confirmEmail) {
      alert("Emails do not match");
      return;
    }
    try {
      let url = isLogin ? `${import.meta.env.VITE_API_URL}/login` : `${import.meta.env.VITE_API_URL}/signup`;
      const body = isLogin 
        ? { email, password }
        : { email, password, username };
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log(data);
      if (data.status === "ok") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        onAuth();
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Authentication failed");
    }
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmEmail('');
  };

return (
  <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-blue-200 to-purple-200">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-[350px] border border-gray-200">
        <div className="flex justify-center mb-6 rounded-full overflow-hidden font-bold shadow-sm bg-gradient-to-r from-blue-100 to-green-100">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 rounded-l-full ${isLogin ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 hover:bg-blue-50'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 rounded-r-full ${!isLogin ? 'bg-gradient-to-l from-green-400 to-blue-600 text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 hover:bg-green-50'}`}
          >
            SignUp
          </button>
        </div>
        {isLogin ? (
          <form onSubmit={submitHandler} className="flex flex-col gap-4 mt-2">
            <h2 className="text-center font-bold text-2xl text-blue-700 mb-2 tracking-wide">Login</h2>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 shadow-sm"
              type="email"
              placeholder="Email address"
              autoComplete="username"
              required
            />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 shadow-sm"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button
              className="py-2 mt-2 text-lg font-bold bg-gradient-to-br from-blue-500 via-green-400 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 hover:from-blue-600 hover:to-green-500 transition-all duration-300 active:scale-95"
            >
              Login
            </button>
            <button
              type="button"
              onClick={googleLogin}
              className="w-full mt-3 py-2 bg-red-500 text-white rounded-xl"
            >
              Continue with Google
            </button>
            <div className="flex justify-between items-center mt-2">
              <a className="text-blue-500 hover:underline text-sm" href="#">Forgot Password?</a>
              <span className="text-gray-500 text-sm">Not a user?
                <a className="text-blue-500 hover:underline ml-1 cursor-pointer" href="" onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(false)
                }}>Signup here</a>
              </span>
            </div>
          </form>
        ) : (
          <form
            onSubmit={submitHandler} className="flex flex-col gap-4 mt-2">
            <h2 className="text-center font-bold text-2xl text-green-700 mb-2 tracking-wide">Sign Up</h2>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition placeholder-gray-400 shadow-sm"
              type="email"
              placeholder="Email address"
              autoComplete="username"
              required
            />
            <input
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition placeholder-gray-400 shadow-sm"
              type="email"
              placeholder="Confirm email"
              autoComplete="off"
              required
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition placeholder-gray-400 shadow-sm"
              type="text"
              placeholder="Username (visible to others)"
              autoComplete="off"
              required
            />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              className="border border-gray-300 p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition placeholder-gray-400 shadow-sm"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
            />
            <button
              className="py-2 mt-2 text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-md hover:scale-105 hover:from-green-500 hover:to-blue-600 transition-all duration-300 active:scale-95"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={googleLogin}
              className="w-full mt-3 py-2 bg-red-500 text-white rounded-xl"
            >
              Continue with Google
            </button>
          </form>
        )}
      </div>
    </div>
  </>
);
};
export default AuthForm;