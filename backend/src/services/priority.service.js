
const Email = require("../models/email.model");

const {
    generatePriority
} = require("./ollama.service");

const {
    findSimilarEmails
} = require("./embedding.service");

const {
    PRIORITY_LEVELS
} = require("../constants/priorityLevels");


// =========================================================
// 1. VALIDATE AI PRIORITY RESULT
// =========================================================

function validatePriorityResult(result) {

    if (!result || typeof result !== "object") {
        throw new Error("Invalid priority result from AI");
    }

    if (!PRIORITY_LEVELS.includes(result.priority)) {
        throw new Error("AI returned an invalid priority level");
    }

    if (
        typeof result.reason !== "string" ||
        result.reason.trim().length === 0
    ) {
        throw new Error("AI returned an invalid priority reason");
    }

    return {
        level: result.priority,
        reason: result.reason.trim()
    };
}


// =========================================================
// 2. GENERATE PRIORITY FOR ONE EMAIL
// =========================================================

async function prioritizeSingleEmail(emailId, userId) {

    // Step 1: Fetch current user's email

    const email = await Email.findOne({
        emailId,
        userId
    });

    if (!email) {
        throw new Error("Email not found");
    }


    // Step 2: Retrieve similar emails

    let similarEmails = [];

    try {

        if (email.embedding?.length) {

            similarEmails = await findSimilarEmails(
                emailId,
                userId
            );

        }

    } catch (error) {

        console.error(
            `Similar email retrieval failed for ${emailId}:`,
            error.message
        );
    }


    // Step 3: Generate priority

    const aiResult = await generatePriority(
        email,
        similarEmails
    );


    // Step 4: Validate AI response

    const priority = validatePriorityResult(aiResult);


    // Step 5: Save priority

    email.priority = priority;

    await email.save();

    return priority;
}


// =========================================================
// 3. EXPORTS
// =========================================================

module.exports = {
    prioritizeSingleEmail
};
