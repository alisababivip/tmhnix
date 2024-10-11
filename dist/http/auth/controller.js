"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = exports.controllers = void 0;
// ./http/auth/controller.ts
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
const utils_1 = require("../../utils");
const queries_1 = require("./queries");
exports.controllers = {
    register: (0, utils_1.handleController)(async (_, __, ___, query, body) => {
        const { first_name, last_name, email, password, ref } = body;
        return await (0, queries_1.registerUser)(first_name, last_name, email, password, ref);
    }),
    login: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.loginUser)(body.email, body.password);
    }),
    loginChat: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { first_name, last_name, email, password } = query;
        return await (0, queries_1.loginUserChat)(email, password, first_name, last_name);
    }),
    loginOtp: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.verifyLoginOTP)(body.uuid, body.otp);
    }),
    resendOtp: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.resendOtp)(body.uuid, body.secret);
    }),
    profile: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return await (0, queries_1.getUserById)(user.id);
    }),
    update: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        const { first_name, last_name, email, metadata, avatar, current_password, new_password, } = body;
        return await (0, queries_1.updateUserQuery)(user.id, first_name, last_name, email, metadata, avatar, current_password, new_password);
    }),
    resetPassword: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.resetPasswordQuery)(body.email);
    }),
    verifyResetPassword: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.verifyPasswordResetQuery)(body.token);
    }),
    sendEmailVerification: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        const { email } = body;
        return await (0, queries_1.sendEmailVerificationToken)(user.id, email);
    }),
    verifyEmail: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return await (0, queries_1.verifyEmailTokenQuery)(body.token);
    }),
    logout: (0, utils_1.handleController)(async (_, req, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return await (0, queries_1.logoutUser)(req, user.id);
    }),
    loginWithWallet: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { walletAddress } = body;
        return await (0, queries_1.loginUserWithWallet)(walletAddress);
    }),
    generateNonce: (0, utils_1.handleController)(async (_, __, ___, ____, _____) => {
        // Implement your logic to generate a nonce
        const nonce = (0, crypto_1.randomBytes)(16).toString('hex');
        return { nonce };
    }),
    verifyMessage: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { message, signature, walletAddress } = body;
        const isVerified = await (0, exports.verifySignature)(message, signature, walletAddress);
        if (!isVerified)
            throw new Error('Signature verification failed');
        return await (0, queries_1.loginUserWithWallet)(walletAddress);
    }),
};
const verifySignature = async (message, signature, expectedAddress) => {
    try {
        // In v6, we use the Signature class for signature operations
        const sig = ethers_1.ethers.Signature.from(signature);
        const messageHash = ethers_1.ethers.hashMessage(message);
        const recoveredAddress = ethers_1.ethers.recoverAddress(messageHash, sig);
        return recoveredAddress === expectedAddress;
    }
    catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
};
exports.verifySignature = verifySignature;
