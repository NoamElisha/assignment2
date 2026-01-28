import { Request, Response } from "express";
import Comment from "../models/Comment";

export const commentController = {
  async create(req: Request, res: Response) {
    const commentData = req.body;
    try {
        const newComment = await Comment.create(req.body);
        res.status(201).json(newComment);
      }
    catch (err){
        console.error(err);
        res.status(500).json({ message: "Error creating comment" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { postId } = req.query;
      let filter = {};
      if (postId) {
        filter = { postId };
      }
      const comments = await Comment.find(filter);
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching comments" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching comment" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { content } = req.body;
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { content },
        { new: true }
      );
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating comment" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const deletedComment = await Comment.findByIdAndDelete(req.params.id);
      if (!deletedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting comment" });
    }
  },
};