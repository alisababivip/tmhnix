"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.verifyPassword = exports.generateNewPassword = exports.makeUuid = exports.hashPassword = exports.makeRandomString32 = void 0;
const argon2_1 = __importDefault(require("argon2"));
const crypto_1 = __importDefault(require("crypto"));
const generate_password_1 = __importDefault(require("generate-password"));
const uuid_1 = require("uuid");
const index_1 = require("./index");
const prisma_1 = __importDefault(require("./prisma"));
/**
 * @desc Returns a random string of 32 characters in hexadecimal
 * @info Can be used to create a secret
 */
function makeRandomString32() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
exports.makeRandomString32 = makeRandomString32;
/**
 * @desc Hashes a password or any string using Argon 2
 * @param password Unhashed password
 */
async function hashPassword(password) {
    try {
        return await argon2_1.default.hash(password);
    }
    catch (err) {
        throw (0, index_1.createError)({
            statusCode: 500,
            statusMessage: err.message,
        });
    }
}
exports.hashPassword = hashPassword;
/**
 * @desc Makes a uuid
 */
function makeUuid() {
    return (0, uuid_1.v4)();
}
exports.makeUuid = makeUuid;
/**
 * @Desc Generates a new password for user given user's uuid
 * @param uuid User's uuid
 * @returns {Promise<Error|string>} Returns generated password or error
 */
async function generateNewPassword(uuid) {
    // Generate secure password consistent with password policy
    const password = generate_password_1.default.generate({
        length: 20,
        numbers: true,
        symbols: true,
        strict: true,
    });
    // Check if password passes password policy
    try {
        validatePassword(password);
    }
    catch (error) {
        throw (0, index_1.createError)({
            statusCode: 400,
            statusMessage: error.message,
        });
    }
    // Hash password
    try {
        const errorOrHashedPassword = await hashPassword(password);
        const hashedPassword = errorOrHashedPassword;
        // Update database
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
        console.error(error);
        throw (0, index_1.createError)({
            statusCode: 500,
            statusMessage: error.message,
        });
    }
}
exports.generateNewPassword = generateNewPassword;
/**
 * @desc Verifies password against a hash
 * @param hash Hashed password
 * @param password Unhashed password
 */
async function verifyPassword(hash, password) {
    try {
        if (await argon2_1.default.verify(hash, password)) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
exports.verifyPassword = verifyPassword;
function validatePassword(password) {
    // Has at least 8 characters
    if (password.length < 8)
        return false;
    // Has uppercase letters
    if (!/[A-Z]/.test(password))
        return false;
    // Has lowercase letters
    if (!/[a-z]/.test(password))
        return false;
    // Has numbers
    if (!/\d/.test(password))
        return false;
    // Has non-alphanumeric characters
    if (!/\W/.test(password))
        return false;
    return true;
}
exports.validatePassword = validatePassword;
