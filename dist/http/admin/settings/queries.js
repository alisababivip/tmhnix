"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function updateSettings(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            let value = data[key];
            // Convert boolean values to 'Enabled' or 'Disabled'
            if (typeof value === 'boolean') {
                value = value ? 'Enabled' : 'Disabled';
            }
            // Convert number values to strings
            if (typeof value === 'number') {
                value = value.toString();
            }
            await prisma_1.default.settings.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
    }
}
exports.updateSettings = updateSettings;
