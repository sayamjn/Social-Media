const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/users');

const router = express.Router();

router.post('/authenticate', async (req, res) => {
    const { name, email, password } = req.body;

    if(!email){
        return res.status(400).json({ message: '"email" is required' });
      }
      if(!password){
        return res.status(400).json({ message: '"password" is required' });
      }

    const user = await User.findOne({ email });

    if(!user){
        return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword){
        return res.status(401).json({ message: 'Email or password is incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
})

module.exports = router;