const mongoose = require("mongoose");
const { EMAIL_CATEGORIES } = require("../constants/emailCategories");
const { PRIORITY_LEVELS } = require("../constants/priorityLevels");

const understandingSchema = new mongoose.Schema(
    {
        summary: {
            type: String,
            required: true
        },

        actionRequired: {
            type: String,
            default: null
        },

        deadline: {
            type: String,
            default: null
        }
    },
    {
        _id: false
    }
);

const prioritySchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: PRIORITY_LEVELS,
            required: true
        },

        reason: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);

const emailSchema = new mongoose.Schema(
    {
        emailId: {
            type: String,
            required: true,
            unique: true
        },

        // Conversation identification
        threadId: {
            type: String,
            default: null
        },

        inReplyTo: {
            type: String,
            default: null
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            name: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true
            }
        },

        subject: {
            type: String,
            required: true
        },

        body: {
            type: String,
            required: true
        },

        receivedAt: {
            type: Date,
            required: true
        },

        category: {
            type: String,
            enum: EMAIL_CATEGORIES,
            default: null
        },

        opened: {
            type: Boolean,
            default: false
        },

        openCount: {
            type: Number,
            default: 0
        },

        lastOpenedAt: {
            type: Date,
            default: null
        },

        replied: {
            type: Boolean,
            default: false
        },

        repliedAt: {
            type: Date,
            default: null
        },

        understanding: {
            type: understandingSchema,
            default: null
        },

        priority: {
            type: prioritySchema,
            default: null
        },

        embedding: {
            type: [Number],
            default: undefined
        }
    },
    {
        timestamps: true
    }
);

// Existing indexes
emailSchema.index({
    userId: 1,
    category: 1
});

emailSchema.index({
    userId: 1,
    receivedAt: -1
});

// Conversation retrieval index
emailSchema.index({
    userId: 1,
    threadId: 1,
    receivedAt: -1
});


const Email = mongoose.model("Email", emailSchema);
module.exports = Email;
