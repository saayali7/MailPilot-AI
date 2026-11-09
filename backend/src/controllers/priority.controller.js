
const Email = require("../models/email.model");


async function getEmailPriority(req, res) {

    try {

        const email = await Email.findOne({
            emailId: req.params.emailId,
            userId: req.user._id
        });

        if (!email) {

            return res.status(404).json({

                success: false,

                error: {
                    message: "Email not found"
                }

            });
        }


        if (!email.priority) {

            return res.status(404).json({

                success: false,

                error: {
                    message: "Priority not generated yet"
                }

            });
        }


        return res.status(200).json({

            success: true,

            data: {
                emailId: email.emailId,
                sender: email.sender,
                subject: email.subject,
                priority: email.priority
            }

        });

    } catch (error) {

        console.error(
            "Priority retrieval failed:",
            error.message
        );

        return res.status(500).json({

            success: false,

            error: {
                message: "Failed to retrieve email priority"
            }

        });
    }
}


module.exports = {
    getEmailPriority
};
