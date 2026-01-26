import Post from "../models/Post";
import { Request, Response } from "express";


export const postController = {
  async create(req: Request, res: Response) {
    const postData = req.body;
    try {
        const newPost = await Post.create(postData);
        res.status(201).json(newPost);
      }
    catch (err){
        console.error(err);
        res.status(500).json({ message: "Error creating post" });
        }
    }, 

    async getAll(req: Request, res: Response) {
        try{
            if (req.query) {
                const filterData = await Post.find(req.query);
                return res.json(filterData);
            } else {
                const allPosts = await Post.find();
                return  res.json(allPosts);
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error retrieving posts" });
        }
    },

    async getById(req: Request, res: Response) {
        const postId = req.params.id;
        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            } else {
                return res.json(post);
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error retrieving post" });
        }
    },

    async update(req: Request, res: Response) {
        const postId = req.params.id;
        const updateData = req.body;
        try {
            const updatedPost = await Post.findByIdAndUpdate(postId, updateData, { new: true });
            res.json(updatedPost);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error updating post" });
        }
    },

    async delete(req: Request, res: Response) {
        const postId = req.params.id;
        try {
            const deletedPost = await Post.findByIdAndDelete(postId);
            if (!deletedPost) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json({ message: "Post deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error deleting post" });
        }
    }
};