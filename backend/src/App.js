const express = require("express");

const authRouter = require("./routes/auth.routes");
const emailRouter = require("./routes/email.routes");
const categoryRouter = require("./routes/category.routes");
const priorityRouter = require("./routes/priority.routes");

const authenticateUser = require("./middleware/auth.middleware");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.originalUrl);
    next();
});

// Public authentication routes
app.use("/api/v1/auth", authRouter);

// Protected feature routes
app.use("/api/v1/emails", authenticateUser, emailRouter);

app.use("/api/v1/categories", authenticateUser, categoryRouter);

app.use("/api/v1/emails", authenticateUser, priorityRouter);

module.exports = app;
