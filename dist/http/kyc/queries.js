"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKyc = exports.createKyc = exports.getKyc = void 0;
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getKyc(userId) {
    return (await prisma_1.default.kyc.findUnique({
        where: {
            user_id: userId,
        },
    }));
}
exports.getKyc = getKyc;
async function createKyc(userId, templateId, templateData, level) {
    const user = (await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    }));
    if (!user) {
        throw new Error('User not found');
    }
    const template = await prisma_1.default.kyc_template.findUnique({
        where: {
            id: templateId,
        },
    });
    if (!template) {
        throw new Error('KYC template not found');
    }
    const existingKyc = await prisma_1.default.kyc.findFirst({
        where: {
            user_id: user.id,
            template_id: template.id,
        },
    });
    // Scenario 1: No existing KYC
    if (!existingKyc) {
        const newKyc = await prisma_1.default.kyc.create({
            data: {
                user_id: user.id,
                template_id: template.id,
                data: templateData,
                level: level,
                status: 'PENDING',
            },
        });
        await (0, emails_1.sendKycEmail)(user, newKyc, 'KycSubmission');
        return newKyc;
    }
    // Scenario 2: Existing KYC with same or higher level and not REJECTED
    if (existingKyc.level >= level && existingKyc.status !== 'REJECTED') {
        throw new Error('You have already submitted a KYC application at this level or higher. Please wait for it to be reviewed.');
    }
    // Scenario 3: Existing KYC with status REJECTED but level not matching the parameter
    if (existingKyc.status === 'REJECTED' && existingKyc.level !== level) {
        throw new Error('Your existing KYC application was rejected. You can only resubmit at the same level.');
    }
    // Scenario 4: Existing KYC with lower level but not APPROVED and not REJECTED
    if (existingKyc.status === 'PENDING') {
        throw new Error('Your existing KYC application is still under review. Please wait for it to be approved before submitting a new one.');
    }
    // Scenario 5: Existing KYC with lower level and APPROVED
    const existingKycData = existingKyc.data; // Type cast to any
    const mergedCustomFields = mergeCustomFields(existingKycData.custom_fields, templateData.custom_fields);
    const mergedData = deepMerge(existingKycData, templateData);
    mergedData.custom_fields = mergedCustomFields;
    // Update existing KYC record
    const updatedKyc = (await prisma_1.default.kyc.update({
        where: {
            id: existingKyc.id,
        },
        data: {
            data: mergedData,
            level: level,
            status: 'PENDING',
        },
    }));
    // Send update email
    await (0, emails_1.sendKycEmail)(user, updatedKyc, 'KycUpdate');
    return updatedKyc;
}
exports.createKyc = createKyc;
async function updateKyc(id, data) {
    return (await prisma_1.default.kyc.update({
        where: {
            id: id,
        },
        data: data,
    }));
}
exports.updateKyc = updateKyc;
function deepMerge(obj1, obj2) {
    if (obj1 === null)
        return obj2;
    if (obj2 === null)
        return obj1;
    if (typeof obj1 !== 'object')
        return obj2;
    if (typeof obj2 !== 'object')
        return obj2;
    const output = { ...obj1 };
    Object.keys(obj2).forEach((key) => {
        if (obj2[key] === null) {
            output[key] = null;
        }
        else if (Array.isArray(obj2[key])) {
            output[key] = obj2[key];
        }
        else if (typeof obj2[key] === 'object') {
            output[key] = deepMerge(obj1[key], obj2[key]);
        }
        else {
            output[key] = obj2[key];
        }
    });
    return output;
}
function mergeCustomFields(existingFields, newFields) {
    const mergedFields = [...existingFields]; // Start with existing fields
    newFields.forEach((newField) => {
        const existingFieldIndex = mergedFields.findIndex((existingField) => existingField.title === newField.title);
        if (existingFieldIndex > -1) {
            // Update existing field
            mergedFields[existingFieldIndex] = {
                ...mergedFields[existingFieldIndex],
                ...newField,
            };
        }
        else {
            // Add new field
            mergedFields.push(newField);
        }
    });
    return mergedFields;
}
