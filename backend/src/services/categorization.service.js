
const Email = require("../models/email.model");

const {
    classifyEmailWithAI
} = require("./ollama.service");

const {
    isValidEmailCategory
} = require("../constants/emailCategories");


/* =========================================================
   VALIDATE AI CLASSIFICATION
========================================================= */

function validateAIClassification(result) {

    if (!result || typeof result !== "object") {
        return false;
    }

    if (!isValidEmailCategory(result.category)) {
        return false;
    }

    return true;
}


/* =========================================================
   CATEGORIZE SINGLE EMAIL
========================================================= */

async function categorizeSingleEmail(emailId, userId) {

    const email = await Email.findOne({
        emailId,
        userId
    });

    if (!email) {
        throw new Error("Email not found");
    }

    // Ask AI to classify the email

    let classification;

    try {

        classification =
            await classifyEmailWithAI(email);

    } catch (error) {

        throw new Error(
            `AI classification failed: ${error.message}`
        );
    }


    // Validate AI response

    if (!validateAIClassification(classification)) {

        throw new Error(
            "Invalid AI classification result"
        );
    }


    // Save category to database

    email.category =
        classification.category;

    await email.save();


    // Return classification result

    return {
        emailId: email.emailId,
        category: classification.category
    };
}


/* =========================================================
   CATEGORIZE ALL USER EMAILS
========================================================= */

async function categorizeAllUserEmails(userId) {

    const emails = await Email.find({
        userId,
        category: null
    }).sort({
        receivedAt: 1
    });


    const results = [];


    for (const email of emails) {

        try {

            const result =
                await categorizeSingleEmail(
                    email.emailId,
                    userId
                );

            results.push({
                emailId: email.emailId,
                success: true,
                category: result.category
            });

        } catch (error) {

            console.error(
                `Failed to categorize ${email.emailId}:`,
                error.message
            );

            results.push({
                emailId: email.emailId,
                success: false,
                error: error.message
            });
        }
    }


    // Return bulk categorization summary

    return {

        userId,

        totalEmails:
            emails.length,

        categorized:
            results.filter(
                result => result.success
            ).length,

        failed:
            results.filter(
                result => !result.success
            ).length,

        results
    };
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    categorizeSingleEmail,
    categorizeAllUserEmails
};
