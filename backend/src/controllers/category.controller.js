
const {
    categorizeAllUserEmails,
    categorizeSingleEmail
} = require("../services/categorization.service");


async function categorizeAllEmails(req, res) {

    try {

        const userId = req.user._id;

        const result =
            await categorizeAllUserEmails(userId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Initial categorization failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
}


async function categorizeExistingEmail(req, res) {

    try {

        const { emailId } = req.params;

        const result =
            await categorizeSingleEmail(
                emailId,
                req.user._id
            );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Email categorization failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
}


module.exports = {
    categorizeAllEmails,
    categorizeExistingEmail
};
