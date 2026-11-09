const express = require("express");

const router = express.Router();

const {
    categorizeAllEmails,
    categorizeExistingEmail
} = require("../controllers/category.controller");

router.post(
    "/categorize-all",
    categorizeAllEmails
);

router.post(
    "/:emailId/categorize",
    categorizeExistingEmail
);

module.exports = router;