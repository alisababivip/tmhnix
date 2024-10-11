"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.updateExtensionQuery = exports.removeSystemReport = exports.storeSystemReport = void 0;
const prisma_1 = __importDefault(require("./prisma"));
async function storeSystemReport(type, reportContent, status) {
    const reportData = {
        notes: reportContent,
        status: status,
    };
    return await prisma_1.default.system_health.upsert({
        where: { name: type },
        update: reportData,
        create: {
            name: type,
            ...reportData,
        },
    });
}
exports.storeSystemReport = storeSystemReport;
async function removeSystemReport(type) {
    return await prisma_1.default.system_health.delete({
        where: { name: type },
    });
}
exports.removeSystemReport = removeSystemReport;
async function updateExtensionQuery(id, version) {
    return await prisma_1.default.extension.update({
        where: {
            product_id: id,
        },
        data: {
            version: version,
        },
    });
}
exports.updateExtensionQuery = updateExtensionQuery;
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.sleep = sleep;
