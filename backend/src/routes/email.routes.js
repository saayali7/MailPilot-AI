const express =
    require("express");

const {
    createEmail,
    getEmailUnderstanding,
} =
    require("../controllers/email.controller");


const router =
    express.Router();


/*
 * Create new email.
 *
 * Normal daily flow.
 */
router.post(
    "/",
    createEmail
);



/*
 * Generate / retrieve understanding.
 */
router.get(
    "/:emailId/understanding",
    getEmailUnderstanding
);




module.exports = router;