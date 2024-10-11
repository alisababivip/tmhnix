"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplateQuery = exports.getTemplateQuery = exports.getTemplatesQuery = void 0;
const utils_1 = require("~~/utils");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTemplatesQuery() {
    return (await prisma_1.default.notification_templates.findMany());
}
exports.getTemplatesQuery = getTemplatesQuery;
async function getTemplateQuery(id) {
    return (await prisma_1.default.notification_templates.findUnique({
        where: {
            id,
        },
    }));
}
exports.getTemplateQuery = getTemplateQuery;
async function updateTemplateQuery(id, data) {
    if (id === undefined || id === null) {
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: "The 'id' parameter is missing.",
        });
    }
    if (!data || Object.keys(data).length === 0) {
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: "The 'data' parameter is missing.",
        });
    }
    return (await prisma_1.default.notification_templates.update({
        where: { id },
        data,
    }));
}
exports.updateTemplateQuery = updateTemplateQuery;
