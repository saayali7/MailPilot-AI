
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Generate JWT
function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}


// =====================================================
// 1. SIGNUP
// =====================================================

async function signup(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate token
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });

    } catch (error) {
        console.error("Signup failed:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create account"
        });
    }
}


// =====================================================
// 2. LOGIN
// =====================================================

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Explicitly include password
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });

    } catch (error) {
        console.error("Login failed:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}


// =====================================================
// 3. LOGOUT
// =====================================================

async function logout(req, res) {
    try {
        // Increment tokenVersion to invalidate old tokens
        await User.updateOne(
            { _id: req.user._id },
            { $inc: { tokenVersion: 1 } }
        );

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout failed:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
}


module.exports = {
    signup,
    login,
    logout
};
