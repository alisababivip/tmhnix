"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
const APP_TWILIO_ACCOUNT_SID = process.env.APP_TWILIO_ACCOUNT_SID;
const APP_TWILIO_AUTH_TOKEN = process.env.APP_TWILIO_AUTH_TOKEN;
const APP_TWILIO_PHONE_NUMBER = process.env.APP_TWILIO_PHONE_NUMBER;
const APP_PUBLIC_SITE_NAME = process.env.APP_PUBLIC_SITE_NAME;
exports.controllers = {
    generateOTPSecret: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw (0, utils_1.createError)({ statusCode: 401, statusMessage: 'unauthorized' });
        const type = body.type;
        const secret = otplib_1.authenticator.generateSecret();
        let otp, qrCode;
        try {
            if (type === 'SMS') {
                const phoneNumber = body.phoneNumber;
                try {
                    await (0, queries_1.savePhoneQuery)(user.id, phoneNumber);
                }
                catch (error) {
                    throw (0, utils_1.createError)({
                        statusCode: 500,
                        statusMessage: error.message,
                    });
                }
                otp = otplib_1.authenticator.generate(secret);
                try {
                    const twilio = require('twilio');
                    const twilioClient = twilio(APP_TWILIO_ACCOUNT_SID, APP_TWILIO_AUTH_TOKEN);
                    await twilioClient.messages.create({
                        body: `Your OTP is: ${otp}`,
                        from: APP_TWILIO_PHONE_NUMBER,
                        to: phoneNumber,
                    });
                }
                catch (error) {
                    throw (0, utils_1.createError)({
                        statusCode: 500,
                        statusMessage: error.message,
                    });
                }
                return {
                    secret,
                };
            }
            else {
                const email = body?.email;
                const otpAuth = otplib_1.authenticator.keyuri(email, APP_PUBLIC_SITE_NAME, secret);
                qrCode = await qrcode_1.default.toDataURL(otpAuth);
                return { secret, qrCode };
            }
        }
        catch (error) {
            throw (0, utils_1.createError)({
                statusCode: 500,
                statusMessage: error.message,
            });
        }
    }),
    verifyOTP: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw (0, utils_1.createError)({ statusCode: 401, statusMessage: 'unauthorized' });
        // Verify
        const isValid = await otplib_1.authenticator.verify({
            token: body.otp,
            secret: body.secret,
        });
        if (!isValid) {
            throw (0, utils_1.createError)({
                statusCode: 401,
                statusMessage: 'Invalid OTP',
            });
        }
        return await (0, queries_1.saveOTPQuery)(user.id, body.secret, body.type);
    }),
    saveOTP: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw (0, utils_1.createError)({ statusCode: 401, statusMessage: 'unauthorized' });
        return await (0, queries_1.saveOTPQuery)(user.id, body.secret, body.type);
    }),
    toggleOtp: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw (0, utils_1.createError)({ statusCode: 401, statusMessage: 'unauthorized' });
        return await (0, queries_1.toggleOTPQuery)(user.id, body.status);
    }),
};
