"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
// controller.ts
const utils_1 = require("~~/utils");
const encrypt_1 = require("~~/utils/encrypt");
const system_1 = require("~~/utils/system");
exports.controllers = {
    setPassphrase: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        const { passphrase } = body;
        if (!passphrase) {
            throw new Error('Passphrase is required');
        }
        try {
            const success = await (0, encrypt_1.setEncryptionKey)(passphrase);
            if (success) {
                // Remove any existing system report for this operation
                try {
                    await (0, system_1.removeSystemReport)('SetEncryptionKey');
                }
                catch (error) { }
                return { message: 'Encryption key set successfully.' };
            }
            else {
                throw new Error('Wrong passphrase');
            }
        }
        catch (error) {
            // Save a system report indicating that the operation failed
            await (0, system_1.storeSystemReport)('SetEncryptionKey', `Failed to set the encryption key: ${error.message}`, false);
            throw new Error(`${error.message}`);
        }
    }),
};
