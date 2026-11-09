
const Email = require("../models/email.model");

async function findConversationHistory(emailId, userId) {

    // Step 1: Find current user's email

    const currentEmail = await Email.findOne({
        emailId,
        userId
    }).select("userId threadId emailId receivedAt");


    if (!currentEmail) {
        throw new Error("Email not found");
    }


    // Step 2: Check whether threadId exists

    if (!currentEmail.threadId) {
        return [];
    }


    // Step 3: Retrieve previous emails from same conversation

    const conversationHistory = await Email.find({

        userId: currentEmail.userId,

        threadId: currentEmail.threadId,

        emailId: {
            $ne: currentEmail.emailId
        },

        receivedAt: {
            $lt: currentEmail.receivedAt
        }

    })
        .select(
            "emailId sender subject body receivedAt category"
        )
        .sort({
            receivedAt: 1
        })
        .lean();


    // Step 4: Return conversation history

    return conversationHistory;
}


module.exports = {
    findConversationHistory
};
