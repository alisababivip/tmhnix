"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOTPQuery = exports.savePhoneQuery = exports.saveOTPQuery = void 0;
const utils_1 = require("~~/utils");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function saveOTPQuery(userId, secret, type) {
    let otpDetails = {};
    let saveOTPError = null;
    if (!secret || !type)
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing required parameters',
        });
    const existingTwoFactor = await prisma_1.default.twofactor.findUnique({
        where: { user_id: userId },
    });
    if (existingTwoFactor) {
        // If a 2FA record already exists for the user, update it
        await prisma_1.default.twofactor
            .update({
            where: { id: existingTwoFactor.id },
            data: {
                secret: secret,
                type: type,
                enabled: true,
            },
        })
            .then((response) => {
            otpDetails = response;
        })
            .catch((e) => {
            console.error(e);
            saveOTPError = e;
        });
    }
    else {
        // If no 2FA record exists for the user, create one
        await prisma_1.default.twofactor
            .create({
            data: {
                user_id: userId,
                secret: secret,
                type: type,
                enabled: true,
            },
        })
            .then((response) => {
            otpDetails = response;
        })
            .catch((e) => {
            console.error(e);
            saveOTPError = e;
        });
    }
    if (saveOTPError)
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    // Create api result
    const newOTPDetails = otpDetails;
    return newOTPDetails;
}
exports.saveOTPQuery = saveOTPQuery;
async function savePhoneQuery(userId, phone) {
    return (await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            phone: phone,
        },
    }));
}
exports.savePhoneQuery = savePhoneQuery;
async function toggleOTPQuery(userId, status) {
    return (await prisma_1.default.twofactor.update({
        where: { user_id: userId },
        data: {
            enabled: status,
        },
    }));
}
exports.toggleOTPQuery = toggleOTPQuery;
