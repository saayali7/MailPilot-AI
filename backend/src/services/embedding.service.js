
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

const MODEL = "voyage-4-lite";
const EMBEDDING_DIMENSIONS = 1024;
const MAX_HISTORY_EMAILS = 100;
const MAX_SIMILAR_EMAILS = 3;

const Email = require("../models/email.model");


// ============================================
// 1. Generate Embedding
// ============================================

async function generateEmbedding(text, inputType = "document") {

    if (!text || !text.trim()) {
        throw new Error("Text cannot be empty");
    }

    if (!process.env.VOYAGE_API_KEY) {
        throw new Error("VOYAGE_API_KEY is missing");
    }

    const response = await fetch(VOYAGE_API_URL, {
        method: "POST",

        headers: {
            "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            input: text,
            model: MODEL,
            input_type: inputType
        })
    });

    if (!response.ok) {
        throw new Error(
            `Voyage API failed: ${response.status} ${await response.text()}`
        );
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (
        !Array.isArray(embedding) ||
        embedding.length !== EMBEDDING_DIMENSIONS
    ) {
        throw new Error("Invalid embedding response or dimensions");
    }

    return embedding;
}


// ============================================
// 2. Generate and Save Email Embedding
// ============================================

async function generateAndSaveEmailEmbedding(emailId, userId) {

    const email = await Email.findOne({
        emailId,
        userId
    });

    if (!email) {
        throw new Error("Email not found");
    }

    const text = `
        Subject: ${email.subject}
        Sender: ${email.sender.name}
        Category: ${email.category}
        Body: ${email.body}
    `;

    const embedding = await generateEmbedding(text);

    email.embedding = embedding;

    await email.save();

    return embedding;
}


// ============================================
// 3. Calculate Cosine Similarity
// ============================================

function cosineSimilarity(vectorA, vectorB) {

    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length !== vectorB.length ||
        vectorA.length === 0
    ) {
        return null;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {

        dotProduct += vectorA[i] * vectorB[i];

        magnitudeA += vectorA[i] ** 2;
        magnitudeB += vectorB[i] ** 2;
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return null;
    }

    return dotProduct / (
        Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    );
}


// ============================================
// 4. Find Semantically Similar Emails
// ============================================

async function findSimilarEmails(emailId, userId) {

    // Step 1: Fetch current user's email

    const currentEmail = await Email.findOne({
        emailId,
        userId
    })
        .select("userId embedding")
        .lean();

    if (!currentEmail) {
        throw new Error("Email not found");
    }

    if (!currentEmail.embedding?.length) {
        throw new Error("Current email embedding not found");
    }

    if (currentEmail.embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error("Invalid current email embedding dimensions");
    }


    // Step 2: Fetch previous emails of the same user

    const previousEmails = await Email.find({
        userId: currentEmail.userId,
        emailId: { $ne: emailId },
        embedding: { $exists: true, $ne: [] }
    })
        .select(
            "emailId subject category receivedAt opened openCount replied repliedAt embedding"
        )
        .sort({ receivedAt: -1 })
        .limit(MAX_HISTORY_EMAILS)
        .lean();


    // Step 3: Calculate similarity scores

    const similarEmails = previousEmails
        .map((email) => {

            if (
                !Array.isArray(email.embedding) ||
                email.embedding.length !== EMBEDDING_DIMENSIONS
            ) {
                return null;
            }

            const similarity = cosineSimilarity(
                currentEmail.embedding,
                email.embedding
            );

            if (similarity === null) {
                return null;
            }

            return {
                emailId: email.emailId,
                subject: email.subject,
                category: email.category,
                receivedAt: email.receivedAt,

                opened: email.opened ?? false,
                openCount: email.openCount ?? 0,
                replied: email.replied ?? false,
                repliedAt: email.repliedAt ?? null,

                similarity: Number(similarity.toFixed(4))
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.similarity - a.similarity);


    // Step 4: Return top similar emails

    return similarEmails.slice(0, MAX_SIMILAR_EMAILS);
}


// ============================================
// 5. Exports
// ============================================

module.exports = {
    generateEmbedding,
    generateAndSaveEmailEmbedding,
    cosineSimilarity,
    findSimilarEmails
};
