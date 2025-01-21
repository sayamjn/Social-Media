const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../model/users');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

router.post('/register', [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { 
      title: 'Register',
      error: errors.array()[0].msg,
      values: { name: req.body.name, email: req.body.email }
    });
  }

  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.render('register', {
        title: 'Register',
        error: 'User already exists',
        values: { name, email }
      });
    }

    user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Register',
      error: 'Server error',
      values: { name: req.body.name, email: req.body.email }
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', {
      title: 'Login',
      error: errors.array()[0].msg,
      email: req.body.email
    });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid credentials',
        email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid credentials',
        email
      });
    }
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('login', {
      title: 'Login',
      error: 'Server error',
      email: req.body.email
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      if (users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
      return res.json(users);
    }

    return res.render('users', { 
      users,
      title: 'User List',
      currentUser: req.user 
    });

  } catch (err) {
    console.error(err.message);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ message: 'Server Error' });
    }
    res.status(500).render('error', { message: 'Server Error' });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/user', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
