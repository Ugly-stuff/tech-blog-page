import express from "express";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

//  CREATE BLOG (PRIVATE)
router.post("/", auth, async (req, res) => {
  try {
    console.log("Creating blog for user:", req.user.userId);
    
    // Fetch user to get username
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const blog = new Blog({
      ...req.body,
      authorId: req.user.userId.toString(),
      authorName: user.username,
      likes: [],
      comments: []
    });

    const savedBlog = await blog.save();
    console.log("Blog created successfully:", savedBlog._id);
    res.json(savedBlog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Failed to create blog" });
  }
});

//  PUBLIC FEED
router.get("/", async (req, res) => {
  try {
    console.log("Fetching public feed");
    
    const blogs = await Blog.find().sort({ createdAt: -1 });
    
    // Populate authorName from User collection if missing
    const populatedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        if (!blog.authorName && blog.authorId) {
          const user = await User.findById(blog.authorId);
          blog.authorName = user?.username || "Unknown Author";
          await blog.save(); // Save the update
        }
        return blog;
      })
    );
    
    console.log("Found", populatedBlogs.length, "blogs");
    res.json(populatedBlogs);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

//  MY BLOGS (PRIVATE)
router.get("/me", auth, async (req, res) => {
  try {
    console.log("Fetching blogs for user:", req.user.userId);
    
    const blogs = await Blog.find({ authorId: req.user.userId.toString() });
    
    // Populate authorName if missing
    const populatedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        if (!blog.authorName && blog.authorId) {
          const user = await User.findById(blog.authorId);
          blog.authorName = user?.username || "Unknown Author";
          await blog.save();
        }
        return blog;
      })
    );
    
    console.log("Found", populatedBlogs.length, "blogs");
    res.json(populatedBlogs);
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// AUTHOR PUBLIC BLOGS
router.get("/author/:authorId", async (req, res) => {
  try {
    console.log("Fetching blogs for author:", req.params.authorId);
    
    const blogs = await Blog.find({ authorId: req.params.authorId })
      .sort({ createdAt: -1});
    
    // Populate authorName if missing
    const populatedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        if (!blog.authorName && blog.authorId) {
          const user = await User.findById(blog.authorId);
          blog.authorName = user?.username || "Unknown Author";
          await blog.save();
        }
        return blog;
      })
    );
    
    console.log("Found", populatedBlogs.length, "blogs for author");
    res.json(populatedBlogs);
  } catch (err) {
    console.error("Error fetching author blogs:", err);
    res.status(500).json({ message: "Failed to fetch author blogs"});
  }
});

//SINGLE BLOG (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching blog:", req.params.id);
    
    const blog = await Blog.findById(req.params.id);
    if(!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Populate authorName if missing
    if (!blog.authorName && blog.authorId) {
      const user = await User.findById(blog.authorId);
      blog.authorName = user?.username || "Unknown Author";
      await blog.save();
    }
    
    console.log("Blog found - Likes:", blog.likes.length, "Comments:", blog.comments.length);
    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(400).json({ message: "Invalid blog id" });
  }
});

//  DELETE BLOG
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Deleting blog:", req.params.id, "User:", req.user.userId);
    
    const blog = await Blog.findOneAndDelete({ 
      _id: req.params.id, 
      authorId: req.user.userId.toString() 
    });
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }
    console.log("Blog deleted successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: "Failed to delete blog" });
  }
});

//  UPDATE BLOG
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("Updating blog:", req.params.id, "User:", req.user.userId);
    
    const blog = await Blog.findOneAndUpdate(
      { 
        _id: req.params.id, 
        authorId: req.user.userId.toString() 
      },
      { 
        title: req.body.title, 
        desc: req.body.desc, 
        content: req.body.content, 
        image: req.body.image 
      },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }
    console.log("Blog updated successfully");
    res.json(blog);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Failed to update blog" });
  }
});

// ADD COMMENT
router.post("/:id/comments", auth, async (req, res) => {
  try {
    console.log("Adding comment to blog:", req.params.id);
    console.log("User:", req.user);
    console.log("Comment text:", req.body.text);
    
    // Fetch user to get username
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newComment = {
      userId: req.user.userId.toString(),
      userName: user.username,
      text: req.body.text,
      createdAt: new Date()
    };

    blog.comments.push(newComment);
    const savedBlog = await blog.save();
    console.log("Comment added successfully");
    res.json({ success: true, comment: newComment, blog: savedBlog });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// DELETE COMMENT
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    console.log("Deleting comment:", req.params.commentId, "from blog:", req.params.id);
    console.log("User:", req.user);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    console.log("Comment userId:", comment.userId, "User ID:", req.user.userId.toString());
    
    if (comment.userId !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    blog.comments = blog.comments.filter(c => c._id.toString() !== req.params.commentId);
    const savedBlog = await blog.save();
    console.log("Comment deleted successfully");
    res.json({ success: true, blog: savedBlog });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

// LIKE BLOG
router.post("/:id/like", auth, async (req, res) => {
  try {
    console.log("Liking blog:", req.params.id);
    console.log("User ID:", req.user.userId);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userIdStr = req.user.userId.toString();
    console.log("Blog likes:", blog.likes);
    console.log("User ID as string:", userIdStr);
    
    if (blog.likes.includes(userIdStr)) {
      return res.status(400).json({ message: "Already liked" });
    }

    blog.likes.push(userIdStr);
    await blog.save();
    console.log("Like added successfully, total likes:", blog.likes.length);
    res.json({ success: true, likes: blog.likes.length });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ message: "Failed to like blog" });
  }
});

// UNLIKE BLOG
router.post("/:id/unlike", auth, async (req, res) => {
  try {
    console.log("Unliking blog:", req.params.id);
    console.log("User ID:", req.user.userId);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userIdStr = req.user.userId.toString();
    console.log("Blog likes:", blog.likes);
    
    if (!blog.likes.includes(userIdStr)) {
      return res.status(400).json({ message: "Not liked yet" });
    }

    blog.likes = blog.likes.filter(id => id !== userIdStr);
    await blog.save();
    console.log("Unlike successful, total likes:", blog.likes.length);
    res.json({ success: true, likes: blog.likes.length });
  } catch (err) {
    console.error("Error unliking blog:", err);
    res.status(500).json({ message: "Failed to unlike blog" });
  }
});

export default router;
