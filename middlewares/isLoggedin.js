const express=require('express');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const app=express();
const dotenv=require('dotenv');
app.use(cookieParser());
dotenv.config();

const isLoggedin=(req, res, next) => {
    const token = req.cookies.token;
    if(token){
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if(err){
                res.redirect('/login');
            }
            else{
                req.user=decoded;
                next();
            }
        })
    }
    else{
        res.redirect('/login');
    }
}

module.exports=isLoggedin;