"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const emails_1 = require("~~/utils/emails");
const system_1 = require("~~/utils/system");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getTemplatesQuery)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_1.getTemplateQuery)(Number(params.id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        try {
            const response = await (0, queries_1.updateTemplateQuery)(Number(params.id), body.data);
            return {
                ...response,
                message: 'Email template updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    testMailer: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { name, email } = query;
        const currentTime = new Date().toISOString();
        const errorOrSent = await (0, emails_1.sendEmail)({
            TO: email,
            FIRSTNAME: name,
            TIME: currentTime,
        }, 'EmailTest');
        if (errorOrSent instanceof Error) {
            await (0, system_1.storeSystemReport)('email', `Test email failed at ${currentTime} with error: ${errorOrSent.message}`, false);
            throw errorOrSent;
        }
        await (0, system_1.storeSystemReport)('email', `Test email sent at ${currentTime}`, true);
        return 'Email sent successfully';
    }),
};
