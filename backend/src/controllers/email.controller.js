
const Email = require("../models/email.model");

const {
    generateUnderstanding
} = require("../services/ollama.service");

const {
    categorizeSingleEmail
} = require("../services/categorization.service");

const {
    prioritizeSingleEmail
} = require("../services/priority.service");

const {
    generateAndSaveEmailEmbedding
} = require("../services/embedding.service");

const {
    findConversationHistory
} = require("../services/conversation.service");


// =========================================================
// 1. CREATE EMAIL
// =========================================================

async function createEmail(req, res) {
    try {
        // Step 1: Create email in MongoDB
        const email = await Email.create({
            ...req.body,
            userId: req.user._id
        });

        // Step 2: Categorize email
        let category = null;

        try {
            const result = await categorizeSingleEmail(
                email.emailId,
                req.user._id
            );

            category = result.category;
        } catch (error) {
            console.error(
                `Categorization failed for ${email.emailId}:`,
                error.message
            );
        }

        // Step 3: Generate and save email embedding
        let embeddingGenerated = false;

        try {
            await generateAndSaveEmailEmbedding(
                email.emailId,
                req.user._id
            );

            embeddingGenerated = true;
        } catch (error) {
            console.error(
                `Embedding generation failed for ${email.emailId}:`,
                error.message
            );
        }

        // Step 4: Generate personalized priority
        let priority = null;

        try {
            priority = await prioritizeSingleEmail(
                email.emailId,
                req.user._id
            );
        } catch (error) {
            console.error(
                `Priority generation failed for ${email.emailId}:`,
                error.message
            );
        }

        // Step 5: Return response
        return res.status(201).json({
            success: true,
            data: {
                emailId: email.emailId,
                threadId: email.threadId,
                inReplyTo: email.inReplyTo,
                sender: email.sender,
                subject: email.subject,
                body: email.body,
                receivedAt: email.receivedAt,
                category,
                priority,
                embeddingGenerated
            }
        });

    } catch (error) {
        console.error(
            "Email creation failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: {
                message: "Failed to create email"
            }
        });
    }
}


// =========================================================
// 2. GET EMAIL UNDERSTANDING
// =========================================================

async function getEmailUnderstanding(req, res) {
    try {
        // Step 1: Find email belonging to logged-in user
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

        // Step 2: Check cached understanding
        if (email.understanding) {
            return res.status(200).json({
                success: true,
                data: {
                    emailId: email.emailId,
                    sender: email.sender,
                    subject: email.subject,
                    summary: email.understanding.summary,
                    actionRequired: email.understanding.actionRequired,
                    deadline: email.understanding.deadline
                }
            });
        }

        // Step 3: Retrieve conversation history
        const conversationHistory = await findConversationHistory(
            email.emailId,
            req.user._id
        );

        // Step 4: Generate contextual understanding
        const understanding = await generateUnderstanding(
            email,
            conversationHistory
        );

        // Step 5: Save understanding
        email.understanding = understanding;
        await email.save();

        // Step 6: Return result
        return res.status(200).json({
            success: true,
            data: {
                emailId: email.emailId,
                sender: email.sender,
                subject: email.subject,
                summary: understanding.summary,
                actionRequired: understanding.actionRequired,
                deadline: understanding.deadline
            }
        });

    } catch (error) {
        console.error("Understanding generation failed:");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
}


// =========================================================
// 3. EXPORTS
// =========================================================

module.exports = {
    createEmail,
    getEmailUnderstanding
};
