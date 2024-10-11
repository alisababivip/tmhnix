"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOneTimeToken = exports.generateNewPassword = exports.getUserById = exports.verifyPasswordResetQuery = exports.resetPasswordQuery = exports.updateUserQuery = exports.logoutUser = exports.resendOtp = exports.verifyLoginOTP = exports.loginUserChat = exports.loginUser = exports.registerUser = exports.getUserByWalletAddress = exports.verifyEmailTokenQuery = exports.sendEmailVerificationToken = exports.loginUserWithWallet = void 0;
// ./http/auth/queries.ts
const date_fns_1 = require("date-fns");
const generate_password_1 = __importDefault(require("generate-password"));
const otplib_1 = require("otplib");
const affiliate_1 = require("~~/utils/affiliate");
const utils_1 = require("../../utils");
const emails_1 = require("../../utils/emails");
const passwords_1 = require("../../utils/passwords");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const token_1 = require("../../utils/token");
const APP_TWILIO_ACCOUNT_SID = process.env.APP_TWILIO_ACCOUNT_SID;
const APP_TWILIO_AUTH_TOKEN = process.env.APP_TWILIO_AUTH_TOKEN;
const APP_TWILIO_PHONE_NUMBER = process.env.APP_TWILIO_PHONE_NUMBER;
const userInclude = {
    role: {
        include: {
            rolepermission: {
                include: {
                    permission: true,
                },
            },
        },
    },
    twofactor: {
        select: {
            type: true,
            enabled: true,
        },
    },
    kyc: {
        select: {
            status: true,
            level: true,
        },
    },
    author: {
        select: {
            uuid: true,
            status: true,
        },
    },
};
// Login user with wallet and return token
const loginUserWithWallet = async (walletAddress) => {
    let isNewUser = false;
    let user = await prisma_1.default.user.findUnique({
        where: { wallet_address: walletAddress },
        include: {
            twofactor: true,
        },
    });
    if (!user) {
        const role = await prisma_1.default.role.findFirst({ where: { name: 'User' } });
        if (!role)
            throw new Error('Default role not found');
        user = (await prisma_1.default.user.create({
            data: {
                wallet_address: walletAddress,
                role: { connect: { id: role.id } },
            },
        }));
        isNewUser = true;
    }
    const publicUser = {
        id: user.id,
        role: user.role_id,
    };
    const accessToken = (0, token_1.generateAccessToken)(publicUser);
    const refreshToken = (0, token_1.generateRefreshToken)(publicUser);
    const csrfToken = (0, token_1.generateCsrfToken)();
    const session = await (0, token_1.createSession)(user.id, accessToken, csrfToken);
    await (0, token_1.storeRefreshToken)(user.id, refreshToken);
    return {
        message: isNewUser
            ? 'New account created successfully'
            : 'You have been logged in successfully',
        cookies: {
            'access-token': accessToken,
            'refresh-token': refreshToken,
            'session-id': session.sid,
            'csrf-token': csrfToken,
        },
    };
};
exports.loginUserWithWallet = loginUserWithWallet;
// send email verification token
const sendEmailVerificationToken = async (userId, email) => {
    const user = await prisma_1.default.user.findUnique({
        where: { email, id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const token = (0, token_1.generateEmailToken)({
        user: {
            uuid: user.uuid,
        },
    });
    try {
        await (0, emails_1.sendEmail)({
            TO: user.email,
            FIRSTNAME: user.first_name,
            CREATED_AT: user.created_at,
            TOKEN: token,
        }, 'EmailVerification');
        return {
            message: 'Email with verification instructions sent successfully',
        };
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusMessage: error.message,
            statusCode: 500,
        });
    }
};
exports.sendEmailVerificationToken = sendEmailVerificationToken;
// verify email token
const verifyEmailTokenQuery = async (token) => {
    const decodedToken = (0, token_1.verifyEmailToken)(token);
    if (!decodedToken) {
        throw new Error('Invalid token');
    }
    if (decodedToken.jti !== (await addOneTimeToken(decodedToken.jti, new Date()))) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
    try {
        await prisma_1.default.user.update({
            where: {
                uuid: decodedToken.user.uuid,
            },
            data: {
                email_verified: true,
            },
        });
        return {
            message: 'Token verified successfully',
        };
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
};
exports.verifyEmailTokenQuery = verifyEmailTokenQuery;
// Get user by wallet address
const getUserByWalletAddress = async (walletAddress) => {
    const user = await prisma_1.default.user.findUnique({
        where: { wallet_address: walletAddress },
        include: userInclude,
    });
    user.password = undefined;
    return user;
};
exports.getUserByWalletAddress = getUserByWalletAddress;
// Register user and return token
const registerUser = async (first_name, last_name, email, password, ref) => {
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('Email already in use');
    }
    if (!(0, passwords_1.validatePassword)(password)) {
        throw new Error('Invalid password format');
    }
    const hashedPassword = await (0, passwords_1.hashPassword)(password);
    const role = await prisma_1.default.role.upsert({
        where: { name: 'User' },
        update: {},
        create: { name: 'User' },
    });
    const newUser = await prisma_1.default.user.create({
        data: {
            first_name,
            last_name,
            uuid: (0, passwords_1.makeUuid)(),
            email,
            password: hashedPassword,
            role: {
                connect: {
                    id: role.id,
                },
            },
        },
    });
    if (ref) {
        console.log('ref', ref);
        await (0, affiliate_1.handleReferralRegister)(ref, newUser.uuid);
    }
    const publicUser = {
        id: newUser.id,
        role: newUser.role_id,
    };
    const accessToken = (0, token_1.generateAccessToken)(publicUser);
    const refreshToken = (0, token_1.generateRefreshToken)(publicUser);
    const csrfToken = (0, token_1.generateCsrfToken)();
    const session = await (0, token_1.createSession)(newUser.id, accessToken, csrfToken);
    await (0, token_1.storeRefreshToken)(newUser.id, refreshToken);
    return {
        message: 'User created successfully',
        cookies: {
            'access-token': accessToken,
            'refresh-token': refreshToken,
            'session-id': session.sid,
            'csrf-token': csrfToken,
        },
    };
};
exports.registerUser = registerUser;
// Login user and return token
const loginUser = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: {
            twofactor: true,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await (0, passwords_1.verifyPassword)(user.password, password);
    if (!isPasswordValid) {
        await prisma_1.default.user.update({
            where: { email },
            data: {
                failed_login_attempts: user.failed_login_attempts + 1,
                last_failed_login: new Date(),
            },
        });
        throw new Error('Invalid password');
    }
    const blockedUntil = (0, date_fns_1.addMinutes)(user.last_failed_login, 5);
    if (user.failed_login_attempts >= 5 && blockedUntil > new Date()) {
        throw new Error('Too many failed login attempts, account is temporarily blocked for 5 minutes');
    }
    await prisma_1.default.user.update({
        where: { email },
        data: {
            failed_login_attempts: 0,
            last_failed_login: null,
        },
    });
    const two_factor = await prisma_1.default.settings.findFirst({
        where: {
            key: 'two_factor',
        },
    });
    if (user.twofactor?.enabled && two_factor && two_factor.value === 'Enabled') {
        const type = user.twofactor?.type;
        const otp = otplib_1.authenticator.generate(user.twofactor.secret);
        try {
            if (type === 'SMS') {
                const phoneNumber = user.phone;
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
            }
            return {
                twofactor: {
                    enabled: true,
                    type: user.twofactor.type,
                    secret: user.twofactor.secret,
                },
                uuid: user.uuid,
                message: '2FA required',
            };
        }
        catch (error) {
            throw (0, utils_1.createError)({
                statusCode: 500,
                statusMessage: error.message,
            });
        }
    }
    const publicUser = {
        id: user.id,
        role: user.role_id,
    };
    const accessToken = (0, token_1.generateAccessToken)(publicUser);
    const refreshToken = (0, token_1.generateRefreshToken)(publicUser);
    const csrfToken = (0, token_1.generateCsrfToken)();
    const session = await (0, token_1.createSession)(user.id, accessToken, csrfToken);
    await (0, token_1.storeRefreshToken)(user.id, refreshToken);
    return {
        message: 'You have been logged in successfully',
        cookies: {
            'access-token': accessToken,
            'refresh-token': refreshToken,
            'session-id': session.sid,
            'csrf-token': csrfToken,
        },
    };
};
exports.loginUser = loginUser;
const loginUserChat = async (email, password, first_name, last_name) => {
    // Validate input
    if (!validateEmail(email) || !(0, passwords_1.validatePassword)(password)) {
        throw new Error('Invalid email or password');
    }
    // Hash password
    const errorOrHashedPassword = await (0, passwords_1.hashPassword)(password);
    const hashedPassword = errorOrHashedPassword;
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
        include: { twofactor: true },
    });
    if (!existingUser) {
        const role = await getOrCreateUserRole();
        const newUser = await createUser({
            first_name,
            last_name,
            email,
            hashedPassword,
            role,
        });
        return await createSessionAndReturnResponse(newUser);
    }
    else {
        await updateUser(existingUser.id, { first_name, last_name, hashedPassword });
        return await createSessionAndReturnResponse(existingUser);
    }
};
exports.loginUserChat = loginUserChat;
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}
async function getOrCreateUserRole() {
    // Implementation for role retrieval/creation
    const role = await prisma_1.default.role.upsert({
        where: { name: 'User' },
        update: {},
        create: { name: 'User' },
    });
    return role;
}
async function createUser(userData) {
    // Implementation for creating a new user
    const newUser = await prisma_1.default.user.create({
        data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            uuid: (0, passwords_1.makeUuid)(),
            email: userData.email,
            password: userData.hashedPassword,
            email_verified: true,
            role: {
                connect: {
                    id: userData.role.id,
                },
            },
        },
    });
    return newUser;
}
async function updateUser(userId, updateData) {
    // Implementation for updating an existing user
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            first_name: updateData.first_name,
            last_name: updateData.last_name,
            password: updateData.hashedPassword,
            email_verified: true,
        },
    });
}
async function createSessionAndReturnResponse(user) {
    // Implementation for creating session, generating tokens, and returning response
    const publicUser = {
        id: user.id,
        role: user.role_id,
    };
    const accessToken = (0, token_1.generateAccessToken)(publicUser);
    const refreshToken = (0, token_1.generateRefreshToken)(publicUser);
    const csrfToken = (0, token_1.generateCsrfToken)();
    const session = await (0, token_1.createSession)(user.id, accessToken, csrfToken);
    await (0, token_1.storeRefreshToken)(user.id, refreshToken);
    return {
        message: 'You have been logged in successfully',
        cookies: {
            'access-token': accessToken,
            'refresh-token': refreshToken,
            'session-id': session.sid,
            'csrf-token': csrfToken,
        },
    };
}
const verifyLoginOTP = async (uuid, otp) => {
    const user = await prisma_1.default.user.findUnique({
        where: { uuid },
        include: {
            twofactor: true,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const isValid = await otplib_1.authenticator.verify({
        token: otp,
        secret: user.twofactor.secret,
    });
    if (!isValid) {
        throw (0, utils_1.createError)({
            statusCode: 401,
            statusMessage: 'Invalid OTP',
        });
    }
    const publicUser = {
        id: user.id,
        role: user.role_id,
    };
    const accessToken = (0, token_1.generateAccessToken)(publicUser);
    const refreshToken = (0, token_1.generateRefreshToken)(publicUser);
    const csrfToken = (0, token_1.generateCsrfToken)();
    const session = await (0, token_1.createSession)(user.id, accessToken, csrfToken);
    await (0, token_1.storeRefreshToken)(user.id, refreshToken);
    return {
        message: 'You have been logged in successfully',
        cookies: {
            'access-token': accessToken,
            'refresh-token': refreshToken,
            'session-id': session.sid,
            'csrf-token': csrfToken,
        },
    };
};
exports.verifyLoginOTP = verifyLoginOTP;
const resendOtp = async (uuid, secret) => {
    if (!uuid || !secret) {
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Invalid request',
        });
    }
    const user = await prisma_1.default.user.findUnique({
        where: { uuid },
        include: {
            twofactor: true,
        },
    });
    if (!user) {
        throw (0, utils_1.createError)({
            statusCode: 404,
            statusMessage: 'User not found',
        });
    }
    if (user.twofactor?.secret !== secret) {
        throw (0, utils_1.createError)({
            statusCode: 401,
            statusMessage: 'Invalid Request',
        });
    }
    const type = user.twofactor?.type;
    const otp = otplib_1.authenticator.generate(user.twofactor.secret);
    try {
        if (type === 'SMS') {
            const phoneNumber = user.phone;
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
        }
        return {
            message: 'OTP sent successfully',
        };
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: error.message,
        });
    }
};
exports.resendOtp = resendOtp;
const logoutUser = async (req, userId) => {
    await (0, token_1.deleteAllRefreshTokens)(userId);
    await (0, token_1.deleteAllSessions)(userId);
    req.user = null;
    return {
        message: 'You have been logged out',
        cookies: {
            'access-token': '',
            'refresh-token': '',
            'session-id': '',
            'csrf-token': '',
        },
    };
};
exports.logoutUser = logoutUser;
const updateUserQuery = async (id, first_name, last_name, email, metadata, avatar, current_password, new_password) => {
    const updateData = {};
    // Only add fields to updateData if they are explicitly provided
    if (first_name !== undefined)
        updateData.first_name = first_name;
    if (last_name !== undefined)
        updateData.last_name = last_name;
    if (email !== undefined)
        updateData.email = email;
    if (metadata !== undefined)
        updateData.metadata = metadata;
    if (avatar !== undefined)
        updateData.avatar = avatar;
    // Handle email uniqueness
    if (email) {
        const existingUserWithEmail = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUserWithEmail && existingUserWithEmail.id !== id) {
            throw new Error('Email already in use by another account');
        }
        updateData.email_verified = false;
    }
    // Handle password update
    if (new_password && current_password) {
        if (!(0, passwords_1.validatePassword)(new_password)) {
            throw new Error('Invalid password format');
        }
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await (0, passwords_1.verifyPassword)(user.password, current_password);
        if (!isPasswordValid) {
            throw new Error('Invalid current password');
        }
        updateData.password = await (0, passwords_1.hashPassword)(new_password);
    }
    else if (new_password && !current_password) {
        throw new Error('Current password is required to set a new password');
    }
    // Perform the update
    await prisma_1.default.user.update({
        where: { id },
        data: updateData,
    });
};
exports.updateUserQuery = updateUserQuery;
// Reset password
const resetPasswordQuery = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = (0, token_1.generateResetToken)({
        user: {
            uuid: user.uuid,
        },
    });
    try {
        await (0, emails_1.sendEmail)({
            TO: user.email,
            FIRSTNAME: user.first_name,
            LAST_LOGIN: user.last_login,
            TOKEN: resetToken,
        }, 'PasswordReset');
        return {
            message: 'Email with reset instructions sent successfully',
        };
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusMessage: error.message,
            statusCode: 500,
        });
    }
};
exports.resetPasswordQuery = resetPasswordQuery;
// Verify password reset token
const verifyPasswordResetQuery = async (token) => {
    const decodedToken = (0, token_1.verifyResetToken)(token);
    if (!decodedToken) {
        throw new Error('Invalid token');
    }
    if (decodedToken.jti !== (await addOneTimeToken(decodedToken.jti, new Date()))) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
    try {
        const password = await generateNewPassword(decodedToken.user.uuid);
        return {
            message: 'Token verified successfully',
            password: password,
            cookies: {
                'access-token': '',
                'refresh-token': '',
                'session-id': '',
                'csrf-token': '',
            },
        };
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Failed to generate new password',
        });
    }
};
exports.verifyPasswordResetQuery = verifyPasswordResetQuery;
// Get user by ID
const getUserById = async (id) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id },
        include: userInclude,
    });
    user.password = undefined;
    return user;
};
exports.getUserById = getUserById;
async function generateNewPassword(uuid) {
    const error = null;
    // Generate secure password consistent with password policy
    const password = generate_password_1.default.generate({
        length: 20,
        numbers: true,
        symbols: true,
        strict: true,
    });
    // Check if password passes password policy
    const isValidPassword = (0, passwords_1.validatePassword)(password);
    if (!isValidPassword) {
        return (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
    // Hash password
    const errorOrHashedPassword = await (0, passwords_1.hashPassword)(password);
    const hashedPassword = errorOrHashedPassword;
    try {
        await prisma_1.default.user.update({
            where: {
                uuid: uuid,
            },
            data: {
                password: hashedPassword,
            },
        });
        return password;
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
}
exports.generateNewPassword = generateNewPassword;
async function addOneTimeToken(tokenId, expiresAt) {
    try {
        await prisma_1.default.onetimetoken.create({
            data: {
                token_id: tokenId,
                expires_at: expiresAt,
            },
        });
        return tokenId;
    }
    catch (error) {
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
}
exports.addOneTimeToken = addOneTimeToken;
