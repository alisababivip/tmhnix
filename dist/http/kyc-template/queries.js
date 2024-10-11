"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveKycTemplate = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getActiveKycTemplate() {
    return (await prisma_1.default.kyc_template.findFirst({
        where: {
            status: true,
        },
    }));
}
exports.getActiveKycTemplate = getActiveKycTemplate;
