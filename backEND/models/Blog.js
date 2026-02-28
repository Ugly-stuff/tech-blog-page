import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    text: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const blogSchema = new mongoose.Schema({
    
    title: String,
    desc: String,
    content: String,
    image: String,
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    authorId: String,
    authorName: String,
    likes: {
      type: [String],
      default: []
    },
    comments: {
      type: [commentSchema],
      default: []
    }
},
    {timestamps: true}
);

export default mongoose.model("Blog", blogSchema);
