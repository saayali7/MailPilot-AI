
const express = require("express");

const {
    signup,
    login,
    logout
} = require("../controllers/auth.controller");

const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route
router.post("/logout", authenticateUser, logout);

module.exports = router;
