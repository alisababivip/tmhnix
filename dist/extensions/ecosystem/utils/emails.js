"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransferConfirmationEmail = exports.sendDepositConfirmationEmail = exports.sendWithdrawalStatusEmail = void 0;
const logger_1 = require("~~/logger");
const emails_1 = require("~~/utils/emails");
const logger = (0, logger_1.createLogger)('Ecosystem Emails');
async function sendWithdrawalStatusEmail(user, status, reason, transactionId, amount, currency) {
    const emailTemplate = 'WithdrawalStatus';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        STATUS: status,
        REASON: reason,
        TRANSACTION_ID: transactionId,
        AMOUNT: amount,
        CURRENCY: currency,
    };
    const errorOrSent = await (0, emails_1.sendEmail)(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Withdrawal Status email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendWithdrawalStatusEmail = sendWithdrawalStatusEmail;
async function sendDepositConfirmationEmail(user, transactionId, amount, currency) {
    const emailTemplate = 'DepositConfirmation';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRANSACTION_ID: transactionId,
        AMOUNT: amount,
        CURRENCY: currency,
    };
    const errorOrSent = await (0, emails_1.sendEmail)(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Deposit Confirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendDepositConfirmationEmail = sendDepositConfirmationEmail;
async function sendTransferConfirmationEmail(user, recipient, transactionId, amount, currency) {
    const emailTemplate = 'TransferConfirmation';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRANSACTION_ID: transactionId,
        AMOUNT: amount,
        CURRENCY: currency,
        RECIPIENT_NAME: `${recipient.first_name} ${recipient.last_name}`,
    };
    const errorOrSent = await (0, emails_1.sendEmail)(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Transfer Confirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendTransferConfirmationEmail = sendTransferConfirmationEmail;
