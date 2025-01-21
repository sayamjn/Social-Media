const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../model/posts');
const User = require('../model/users');

router.post('/posts',
  [auth, [check('title', 'Title is required').not().isEmpty(), check('description', 'Description is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Invalid inputs'});
    }
   
    try {
      const post = new Post({
        title: req.body.title,
        description: req.body.description,
        author: req.user.id
      });

      await post.save();

      res.json({
        id: post.id,
        title: post.title,
        description: post.description,
        createdAt: post.createdAt
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get("/posts", async (req, res) => {
  try {
      const posts = await Post.find({}).populate('author', 'name');
      
      if (req.headers.accept?.includes('application/json')) {
          return res.json(posts);
      }

      res.render('posts', { posts: posts });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});

router.put('/post/:id', auth, async (req, res) => {
    try {
      const post = await Post.findOne({ _id: req.params.id, author: req.user.id });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const { title, description } = req.body;
      post.title = title || post.title;
      post.description = description || post.description;
  
      await post.save();
      res.json({ message: 'Post updated', post });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

router.delete("/post/:id", auth, async (req, res) => {
    try {

        const post = await Post.findOne({ _id: req.params.id, author: req.user.id });
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }

        const id = req.params.id;
        await Post.deleteOne({ _id: id });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;