const express = require('express')
const app = express();
const dotenv = require('dotenv');
const {connection} = require('./db/connection');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isLoggedin = require('./middlewares/isLoggedin');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
dotenv.config();
connection();
const userModel = require('./model/user');
const taskModel = require('./model/tasks');
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('registration');
})

app.post('/registration', async (req, res) => {
    const {name, email, password} = req.body;
    const user =await userModel.findOne({email});
    if(user){
        res.redirect('/login');
    }
    else{
        bcrypt.hash(password, 5, async (err, hash) => {
            const user = new userModel({name, email, password: hash});
            await user.save();
            const token = jwt.sign({id: user._id, email: user.email}, process.env.SECRET);
            res.cookie('token', token);
            res.redirect('/login');
        })
    }
});

app.get('/login', (req, res) => {
    res.render('Login');
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if(user){
        bcrypt.compare(password, user.password, (err, result) => {
            if(result){
                const token = jwt.sign({id: user._id, email: user.email}, process.env.SECRET);
                res.cookie('token', token);
                res.redirect('/dashboard');
            }
            else{
                res.redirect('/login');
            }
        })
    }
    else{
        res.redirect('/login');
    }
});

app.get('/dashboard', isLoggedin, async (req, res) => {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    const tasks = await userModel.findById(userId).populate('tasks');
    res.render('dashboard', {user, tasks});
})

app.post('/tasks/:userId', isLoggedin, async (req, res) => {
    const {title} = req.body;
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    const task = new taskModel({title});
    await task.save();
    user.tasks.push(task);
    await user.save();
    res.redirect('/dashboard');
})

app.get('/tasks/delete/:userId/:taskId', isLoggedin, async (req, res) => {
    const userId = req.params.userId;
    const taskId = req.params.taskId;
    const user = await userModel.findById(userId);
    user.tasks.pull(taskId);
    const task = await taskModel.findByIdAndDelete(taskId);
    await user.save();
    res.redirect('/dashboard');
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
})

app.listen(process.env.port, () => {
    console.log(`server is running on port ${process.env.port}`);
})

