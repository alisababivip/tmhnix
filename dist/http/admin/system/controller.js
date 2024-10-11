"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNavigation = exports.controllers = void 0;
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("~~/utils");
const api_1 = require("~~/utils/api");
const queries_1 = require("./queries");
const rootPath = `${process.cwd()}/.app`;
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getExtensionsQuery)();
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, queries_1.updateExtensionStatusQuery)(body.productId, body.status);
    }),
    checkLatestVersion: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, api_1.checkLatestVersion)(body.productId);
    }),
    checkUpdate: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, api_1.checkUpdate)(body.productId, body.currentVersion);
    }),
    verifyLicense: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, api_1.verifyLicense)(body.productId, body.purchaseCode, body.envatoUsername);
    }),
    activateLicense: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, api_1.activateLicense)(body.productId, body.purchaseCode, body.envatoUsername);
    }),
    downloadUpdate: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, api_1.downloadUpdate)(body.productId, body.updateId, body.version, body.product, body.type);
    }),
    getProduct: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, api_1.getProduct)(params.name);
    }),
    updateNavigation: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return updateNavigation(body.data);
    }),
};
async function updateNavigation(menu) {
    if (!menu) {
        throw new Error('Navigation menu is undefined');
    }
    // Read the current navigation data
    const filePath = `${rootPath}/data/navigation.json`;
    const currentNavigation = readJSONFile(filePath);
    if (!currentNavigation) {
        throw new Error('Could not read navigation file');
    }
    // Write the updated navigation data back to the file
    const success = writeJSONFile(filePath, menu);
    if (!success) {
        throw new Error('Could not write navigation file');
    }
    return 'Navigation updated successfully';
}
exports.updateNavigation = updateNavigation;
function readJSONFile(filePath) {
    try {
        const data = fs_1.default.readFileSync(filePath, 'utf-8');
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return null;
    }
}
function writeJSONFile(filePath, data) {
    if (!data) {
        console.error('Data is undefined or null');
        return false;
    }
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs_1.default.writeFileSync(filePath, jsonData, 'utf-8');
        return true;
    }
    catch (error) {
        console.error(`Error writing file: ${error.message}`);
        return false;
    }
}
