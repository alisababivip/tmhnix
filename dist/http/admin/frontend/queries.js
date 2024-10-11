"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFrontendSectionStatus = exports.updateFrontendSection = exports.getFrontendSection = exports.getFrontendSections = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const utils_1 = require("~~/utils");
async function getFrontendSections() {
    return await prisma_1.default.frontend.findMany();
}
exports.getFrontendSections = getFrontendSections;
async function getFrontendSection(id) {
    return await prisma_1.default.frontend.findUnique({
        where: { id },
    });
}
exports.getFrontendSection = getFrontendSection;
async function updateFrontendSection(id, section) {
    return await prisma_1.default.frontend.update({
        where: { id },
        data: {
            content: section,
        },
    });
}
exports.updateFrontendSection = updateFrontendSection;
async function updateFrontendSectionStatus(ids, status) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        console.log('Missing ids');
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing ids',
        });
    }
    // Update each frontend status
    try {
        await prisma_1.default.frontend.updateMany({
            where: {
                id: {
                    in: ids,
                },
            },
            data: {
                status: status,
            },
        });
    }
    catch (error) {
        console.error(error);
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: error.message,
        });
    }
}
exports.updateFrontendSectionStatus = updateFrontendSectionStatus;
