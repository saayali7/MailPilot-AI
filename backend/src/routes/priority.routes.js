const express =
    require("express");

const {
    getEmailPriority
} = require("../controllers/priority.controller");

const router =
    express.Router();


router.get(
    "/:emailId",
    getEmailPriority
);


module.exports = router;