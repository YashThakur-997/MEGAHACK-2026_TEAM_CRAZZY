const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
require('dotenv').config();

const jwt = require('jsonwebtoken');

const login_handler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // res.send({ message: 'Login successful', token: token });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).send({
            message: 'Login successful',
            token,
            username: user.username,
            uploadedServices: []
        });

    }
    catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

const signup_handler = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(409).send('User already exists');
        }
        const newUser = new UserModel({ username, email, password });
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();
        res.status(201).send('User registered successfully');
    }
    catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

const logout_handler = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('Authorization');
    res.redirect('/login');
};

module.exports = {
    login_handler,
    signup_handler,
    logout_handler
};
