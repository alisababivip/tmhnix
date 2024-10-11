"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKycTemplateStatus = exports.deleteKycTemplate = exports.updateKycTemplate = exports.createKycTemplate = exports.getKycTemplate = exports.getKycTemplates = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getKycTemplates() {
    return (await prisma_1.default.kyc_template.findMany({
        include: {
            kyc: true,
        },
    }));
}
exports.getKycTemplates = getKycTemplates;
async function getKycTemplate(id) {
    return (await prisma_1.default.kyc_template.findUnique({
        where: {
            id: id,
        },
        include: {
            kyc: true,
        },
    }));
}
exports.getKycTemplate = getKycTemplate;
async function createKycTemplate(data) {
    return (await prisma_1.default.kyc_template.create({
        data: {
            title: data.title,
            options: data.options,
            status: false,
        },
    }));
}
exports.createKycTemplate = createKycTemplate;
async function updateKycTemplate(id, data) {
    return (await prisma_1.default.kyc_template.update({
        where: {
            id: id,
        },
        data: {
            title: data.title,
            options: data.options,
        },
    }));
}
exports.updateKycTemplate = updateKycTemplate;
async function deleteKycTemplate(id) {
    await prisma_1.default.kyc_template.delete({
        where: {
            id: id,
        },
    });
}
exports.deleteKycTemplate = deleteKycTemplate;
async function updateKycTemplateStatus(ids, status) {
    await prisma_1.default.kyc_template.updateMany({
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
exports.updateKycTemplateStatus = updateKycTemplateStatus;
