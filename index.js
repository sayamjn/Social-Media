require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', userRouter);
app.use('/', authRouter);
app.use('/',postRouter);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { title: "Social Media App" });
});

app.listen(3000, () => { console.log('Server is running on port 3000'); });