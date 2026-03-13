let jwt = require('jsonwebtoken');
let dotenv = require('dotenv');
const UserModel = require('../models/users');

dotenv.config();

let authMiddleware = (req, res, next) => {
    let token = req.headers['authorization'] || req.cookies?.token;

    // --- FIX: Check if token exists BEFORE calling .startsWith() ---
    if (!token) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }
    // ----------------------------------------------------------------

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token.' });
        }

        // Backfill role for older tokens/users where role is absent in payload.
        if (!user.role && user.id) {
            try {
                const dbUser = await UserModel.findById(user.id).select('role');
                if (dbUser?.role) {
                    user.role = dbUser.role;
                }
            } catch (dbErr) {
                return res.status(500).send({ message: 'Unable to validate user role.' });
            }
        }

        req.user = user;
        next();
    });
};

module.exports = authMiddleware;
