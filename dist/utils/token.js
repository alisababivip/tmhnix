"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCsrfToken = exports.validateCsrfSessionToken = exports.findSession = exports.findActiveSession = exports.deleteAllSessions = exports.createSession = exports.getRefreshTokenRecord = exports.deactivateAllTokensIfStolen = exports.findActiveRefreshToken = exports.deleteAllRefreshTokens = exports.storeRefreshToken = exports.verifyEmailToken = exports.verifyResetToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateCsrfToken = exports.generateEmailToken = exports.generateResetToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passwords_1 = require("./passwords");
const prisma_1 = __importDefault(require("./prisma"));
const APP_ACCESS_TOKEN_SECRET = process.env.APP_ACCESS_TOKEN_SECRET || 'secret';
const APP_REFRESH_TOKEN_SECRET = process.env.APP_REFRESH_TOKEN_SECRET || 'secret';
const APP_RESET_TOKEN_SECRET = process.env.APP_RESET_TOKEN_SECRET || 'secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '14d';
const JWT_RESET_EXPIRY = process.env.JWT_RESET_EXPIRY || '1h';
// Generate Access Token
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, APP_ACCESS_TOKEN_SECRET, {
        expiresIn: JWT_EXPIRY,
        issuer: 'platform',
        jwtid: (0, passwords_1.makeUuid)(),
    });
};
exports.generateAccessToken = generateAccessToken;
// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, APP_REFRESH_TOKEN_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY,
        issuer: 'platform',
        jwtid: (0, passwords_1.makeUuid)(),
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Generate Reset Token
const generateResetToken = (user) => {
    return jsonwebtoken_1.default.sign(user, APP_RESET_TOKEN_SECRET, {
        expiresIn: JWT_RESET_EXPIRY,
        issuer: 'platform',
        jwtid: (0, passwords_1.makeUuid)(),
    });
};
exports.generateResetToken = generateResetToken;
const generateEmailToken = (user) => {
    return jsonwebtoken_1.default.sign(user, APP_RESET_TOKEN_SECRET, {
        expiresIn: '1d',
        issuer: 'platform',
        jwtid: (0, passwords_1.makeUuid)(),
    });
};
exports.generateEmailToken = generateEmailToken;
// Generate CSRF Token
const generateCsrfToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateCsrfToken = generateCsrfToken;
// Verify Access Token
const verifyAccessToken = (token) => {
    if (!token || !token.includes(' ')) {
        return null;
    }
    const cookieToken = token.split(' ')[1];
    try {
        return jsonwebtoken_1.default.verify(cookieToken, APP_ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Verify Refresh Token
const verifyRefreshToken = (token) => {
    if (!token || !token.includes(' ')) {
        return null;
    }
    const cookieToken = token.split(' ')[1];
    try {
        return jsonwebtoken_1.default.verify(cookieToken, APP_REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//  Verify Reset Token
const verifyResetToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, APP_RESET_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyResetToken = verifyResetToken;
//  Verify Email Token
const verifyEmailToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, APP_RESET_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyEmailToken = verifyEmailToken;
// Stores a refresh token for a user
const storeRefreshToken = async (userId, token) => {
    try {
        // Transaction to ensure atomicity
        return await prisma_1.default.$transaction(async (prisma) => {
            // Delete all existing refresh tokens for the user
            await prisma.refreshtokens.deleteMany({
                where: { user_id: userId },
            });
            // Store the new refresh token
            return prisma.refreshtokens.create({
                data: {
                    user_id: userId,
                    token_id: token,
                    is_active: true,
                },
            });
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            console.error(`Unique constraint error for userId ${userId}: ${error.meta.target}`);
        }
        else {
            console.error('An unexpected error occurred:', error);
        }
        throw error;
    }
};
exports.storeRefreshToken = storeRefreshToken;
// Deletes all refresh tokens for a user
const deleteAllRefreshTokens = async (userId) => {
    await prisma_1.default.refreshtokens.deleteMany({
        where: { user_id: userId },
    });
};
exports.deleteAllRefreshTokens = deleteAllRefreshTokens;
// Deactivates all refresh tokens if a refresh token is stolen
const findActiveRefreshToken = async (userId) => {
    return prisma_1.default.refreshtokens.findFirst({
        where: {
            user_id: userId,
            is_active: true,
        },
    });
};
exports.findActiveRefreshToken = findActiveRefreshToken;
// Deactivates all refresh tokens if a refresh token is stolen
const deactivateAllTokensIfStolen = async (userId, incomingToken) => {
    const foundToken = await prisma_1.default.refreshtokens.findFirst({
        where: {
            user_id: userId,
            token_id: incomingToken,
            is_active: false,
        },
    });
    if (foundToken) {
        await (0, exports.deleteAllRefreshTokens)(userId);
        return true;
    }
    return false;
};
exports.deactivateAllTokensIfStolen = deactivateAllTokensIfStolen;
// Finds an active refresh token for a user
const getRefreshTokenRecord = async (token) => {
    return prisma_1.default.refreshtokens.findUnique({
        where: { token_id: token },
    });
};
exports.getRefreshTokenRecord = getRefreshTokenRecord;
// Creates a new session for a user
const createSession = async (userId, accessToken, csrfToken) => {
    try {
        return await prisma_1.default.$transaction(async (prisma) => {
            // Delete all existing sessions for the user
            await prisma.session.deleteMany({
                where: { user_id: userId },
            });
            // Create a new session
            return prisma.session.create({
                data: {
                    user_id: userId,
                    sid: (0, passwords_1.makeUuid)(),
                    access_token: accessToken,
                    csrf_token: csrfToken,
                    is_active: true,
                    ip_address: '',
                },
            });
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createSession = createSession;
// Deletes all sessions for a user
const deleteAllSessions = async (userId) => {
    await prisma_1.default.session.deleteMany({
        where: { user_id: userId },
    });
};
exports.deleteAllSessions = deleteAllSessions;
// Finds an active session for a user
const findActiveSession = async (userId, csrfToken) => {
    return prisma_1.default.session.findFirst({
        where: {
            user_id: userId,
            csrf_token: csrfToken,
            is_active: true,
        },
    });
};
exports.findActiveSession = findActiveSession;
const findSession = async (sessionId) => {
    if (!sessionId)
        throw new Error('Session ID is required');
    try {
        return prisma_1.default.session.findUnique({
            where: { sid: sessionId },
        });
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.findSession = findSession;
// Validate CSRF Session Token
async function validateCsrfSessionToken(sessionId, csrfToken) {
    return await prisma_1.default.session.findFirst({
        where: {
            sid: sessionId,
            csrf_token: csrfToken,
            is_active: true,
        },
    });
}
exports.validateCsrfSessionToken = validateCsrfSessionToken;
// Validate CSRF Token
const validateCsrfToken = async (sessionId, csrfToken) => {
    const session = await prisma_1.default.session.findFirst({
        where: {
            sid: sessionId,
            csrf_token: csrfToken,
            is_active: true,
        },
    });
    if (session) {
        return true;
    }
    return false;
};
exports.validateCsrfToken = validateCsrfToken;
