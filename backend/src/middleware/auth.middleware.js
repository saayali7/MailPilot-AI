
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function authenticateUser(req, res, next) {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        // Check whether token has been invalidated
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });
        }

        // Attach authenticated user to request
        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication failed:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

module.exports = authenticateUser;
