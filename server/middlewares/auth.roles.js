let allowedRoles = ['manufacturer']; // Example roles, adjust as needed

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Check if user exists (set by your common JWT middleware)
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }

        // 2. Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access Denied: ${req.user.role} role not permitted` 
            });
        }

        next();
    };
};

module.exports = authorizeRoles;