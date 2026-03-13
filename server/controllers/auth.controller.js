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
        const token = jwt.sign({ id: user._id , role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // res.send({ message: 'Login successful', token: token });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).send({
            message: 'Login successful',
            token,
            email: user.email,
            role: user.role,
            walletAddress: user.walletAddress
        });

    }
    catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

const signup_handler = async (req, res) => {
    try {
        const {
            email,
            password,
            role,
            walletAddress,
            manufacturerDetails,
            distributorDetails,
            patientDetails,
        } = req.body;

        const normalizedRole = role?.toUpperCase();

        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(409).send('User already exists');
        }

        const payload = {
            email,
            password,
            role: normalizedRole,
            walletAddress,
        };

        if (normalizedRole === 'MANUFACTURER') {
            payload.manufacturerDetails = manufacturerDetails;
        }

        if (normalizedRole === 'DISTRIBUTOR') {
            payload.distributorDetails = distributorDetails;
        }

        if (normalizedRole === 'PATIENT' || normalizedRole === 'PHARMACY') {
            payload.patientDetails = patientDetails;
        }

        const newUser = new UserModel(payload);
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();
        res.status(201).send('User registered successfully');
    }
    catch (err) {
        if (err.code === 11000) {
            const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(409).send({
                message: `${duplicateField} already exists`,
                error: err.message,
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).send({
                message: 'Validation error',
                error: err.message,
            });
        }

        res.status(500).send({
            message: 'Internal Server Error',
            error: err.message,
        });
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
