"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnlockedEcosystemVault = exports.decrypt = exports.encrypt = exports.setDynamicEncryptionKey = exports.setEncryptionKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("~~/logger");
const logger = (0, logger_1.createLogger)('Ecosystem Encryption');
let dynamicEncryptionKey = null;
const encryptedKey = process.env.ENCRYPTED_ENCRYPTION_KEY;
const passphrase = process.env.ENCRYPTION_KEY_PASSPHRASE;
if (encryptedKey && passphrase) {
    setEncryptionKey(passphrase);
}
function decryptEncryptionKey(encryptedKey, passphrase) {
    if (!encryptedKey || !passphrase) {
        throw new Error('Encrypted key or passphrase is missing');
    }
    try {
        const [iv, authTag, cipherText, salt] = encryptedKey
            .split(':')
            .map((part) => Buffer.from(part, 'hex'));
        const key = crypto_1.default.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherText, null, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        logger.error('Decryption failed:', error);
        throw new Error('Decryption failed');
    }
}
async function setEncryptionKey(passphrase) {
    if (!passphrase) {
        throw new Error('Passphrase is required to set encryption key');
    }
    try {
        const decryptedKey = decryptEncryptionKey(encryptedKey, passphrase);
        setDynamicEncryptionKey(decryptedKey);
        return true;
    }
    catch (error) {
        logger.error('Failed to set the encryption key:', error);
        return false;
    }
}
exports.setEncryptionKey = setEncryptionKey;
function setDynamicEncryptionKey(key) {
    if (!key) {
        throw new Error('Encryption key is required');
    }
    dynamicEncryptionKey = Buffer.from(key, 'hex');
}
exports.setDynamicEncryptionKey = setDynamicEncryptionKey;
function encrypt(text) {
    if (!dynamicEncryptionKey) {
        throw new Error('Encryption key is not set');
    }
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', dynamicEncryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
exports.encrypt = encrypt;
function decrypt(text) {
    if (!dynamicEncryptionKey) {
        logger.error('Encryption key is not set');
        throw new Error('Encryption key is not set');
    }
    const [ivHex, authTagHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', dynamicEncryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
exports.decrypt = decrypt;
function isUnlockedEcosystemVault() {
    return !!dynamicEncryptionKey;
}
exports.isUnlockedEcosystemVault = isUnlockedEcosystemVault;
