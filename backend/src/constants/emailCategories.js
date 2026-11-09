const EMAIL_CATEGORIES = Object.freeze([
    "WORK",
    "FINANCE",
    "SHOPPING",
    "TRAVEL",
    "EDUCATION",
    "PERSONAL",
    "SOCIAL",
    "EVENTS",
    "ACCOUNT_SECURITY",
    "NEWSLETTERS",
    "OTHER"
]);

const EMAIL_CATEGORY_DESCRIPTIONS = Object.freeze({
    WORK:
        "Employment, jobs, internships, recruiters, interviews, workplace communication, clients, projects, business and professional activities.",

    FINANCE:
        "Banking, transactions, payments, credit cards, loans, investments, statements, bills and other financial activity.",

    SHOPPING:
        "Purchases, orders, deliveries, returns, refunds, receipts and shopping-related communication.",

    TRAVEL:
        "Flights, trains, hotels, transportation, travel bookings, itineraries and travel-related communication.",

    EDUCATION:
        "Classes, courses, exams, assignments, academic notices, university or school activities and learning.",

    PERSONAL:
        "Ordinary personal communication with friends, family or other individuals that is not primarily an event or another defined category.",

    SOCIAL:
        "Social network notifications, social interactions, connection updates and social-platform activity.",

    EVENTS:
        "Invitations, scheduled events, birthdays, weddings, appointments and other specific events.",

    ACCOUNT_SECURITY:
        "Password changes, login alerts, verification codes, suspicious activity, security warnings and account protection.",

    NEWSLETTERS:
        "Recurring informational emails, digests, subscriptions and newsletter-style content.",

    OTHER:
        "Emails that do not meaningfully fit any of the defined categories."
});

function isValidEmailCategory(category) {
    return EMAIL_CATEGORIES.includes(category);
}

module.exports = {
    EMAIL_CATEGORIES,
    EMAIL_CATEGORY_DESCRIPTIONS,
    isValidEmailCategory
};