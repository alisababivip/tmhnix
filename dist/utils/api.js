"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadUpdate = exports.checkUpdate = exports.checkLatestVersion = exports.activateLicense = exports.verifyLicense = exports.callApi = exports.getPublicIp = exports.fetchPublicIp = exports.getProduct = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const promises_1 = require("stream/promises");
const system_1 = require("./system");
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)('Api');
let cachedIP = null;
let lastFetched = null;
let nextVerificationDate = null;
const verificationPeriodDays = 3;
const rootPath = process.cwd();
async function getProduct(name) {
    try {
        const filePath = `${rootPath}/platform.json`;
        const fileContent = await fs_1.promises.readFile(filePath, 'utf8');
        const products = JSON.parse(fileContent);
        const product = products.find((item) => item.name === name);
        if (!product) {
            logger.error(`Product with name ${name} not found`);
            throw new Error(`Product with name ${name} not found`);
        }
        return product;
    }
    catch (error) {
        logger.error(`Error getting product: ${error.message}`);
        throw new Error(error.message);
    }
}
exports.getProduct = getProduct;
async function fetchPublicIp() {
    try {
        // Assuming $fetch is a global fetch function
        const response = await (0, node_fetch_1.default)('https://api.ipify.org?format=json');
        const json = await response.json();
        return json.ip;
    }
    catch (error) {
        logger.error(`Error fetching public IP: ${error.message}`);
        return null;
    }
}
exports.fetchPublicIp = fetchPublicIp;
async function getPublicIp() {
    const now = Date.now();
    if (cachedIP && lastFetched && now - lastFetched < 60000) {
        // 1 minute cache
        return cachedIP;
    }
    cachedIP = await fetchPublicIp();
    lastFetched = now;
    return cachedIP;
}
exports.getPublicIp = getPublicIp;
async function callApi(method, url, data = null, filename) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'LB-API-KEY': process.env.API_LICENSE_API_KEY,
            'LB-URL': process.env.APP_PUBLIC_URL,
            'LB-IP': await getPublicIp(),
            'LB-LANG': 'en',
        };
        const response = await (0, node_fetch_1.default)(url, {
            method: method,
            headers: headers,
            body: data,
            timeout: 30000, // 30 seconds
        });
        if (response.headers.get('content-type') === 'application/zip') {
            if (!filename) {
                throw new Error('Filename must be provided for zip content.');
            }
            const buffer = [];
            await (0, promises_1.pipeline)(response.body, async function* (source) {
                for await (const chunk of source) {
                    buffer.push(chunk);
                }
            });
            const completeBuffer = Buffer.concat(buffer);
            const dirPath = `${rootPath}/updates`;
            const filePath = `${dirPath}/${filename}.zip`;
            // Ensure the directory exists
            await fs_1.promises.mkdir(dirPath, { recursive: true });
            await fs_1.promises.writeFile(filePath, completeBuffer);
            return {
                status: 'success',
                type: 'zip',
                message: 'Update file downloaded successfully',
                path: filePath,
            };
        }
        else {
            const result = await response.json();
            if (response.status !== 200) {
                logger.error(`API call failed: ${result.message}`);
                throw new Error(result.message);
            }
            return result;
        }
    }
    catch (error) {
        logger.error(`API call failed: ${error.message}`);
        throw new Error(error.message);
    }
}
exports.callApi = callApi;
async function verifyLicense(productId, license, client, timeBasedCheck) {
    const licenseFilePath = `${rootPath}/${productId}.lic`;
    let data;
    try {
        // Check if a license file exists
        const licenseFileContent = await fs_1.promises.readFile(licenseFilePath, 'utf8');
        data = {
            product_id: productId,
            license_file: licenseFileContent,
            license_code: null,
            client_name: null,
        };
    }
    catch (err) {
        logger.error(`Error reading license file: ${err.message}`);
        // File does not exist or other error occurred
        data = {
            product_id: productId,
            license_file: null,
            license_code: license,
            client_name: client,
        };
    }
    if (timeBasedCheck && verificationPeriodDays > 0) {
        const today = new Date();
        if (nextVerificationDate && today < nextVerificationDate) {
            return { status: true, message: 'Verified from cache' };
        }
    }
    try {
        const response = await callApi('POST', `${process.env.APP_LICENSE_API_URL}/api/verify_license`, JSON.stringify(data));
        if (timeBasedCheck && verificationPeriodDays > 0 && response.status) {
            const today = new Date();
            nextVerificationDate = new Date();
            nextVerificationDate.setDate(today.getDate() + verificationPeriodDays);
        }
        if (!response.status) {
            logger.error(`License verification failed: ${response.message}`);
            throw new Error(response.message);
        }
        return {
            message: response.message,
        };
    }
    catch (error) {
        logger.error(`License verification failed: ${error.message}`);
        throw new Error(error.message);
    }
}
exports.verifyLicense = verifyLicense;
async function activateLicense(productId, license, client) {
    const data = {
        product_id: productId,
        license_code: license,
        client_name: client,
        verify_type: 'envato',
    };
    try {
        const response = await callApi('POST', `${process.env.APP_LICENSE_API_URL}/api/activate_license`, JSON.stringify(data));
        if (!response.status) {
            logger.error(`License activation failed: ${response.message}`);
            throw new Error(response.message);
        }
        // If activation is successful, save the license
        if (response.lic_response) {
            const licFileContent = response.lic_response;
            const licenseFilePath = `${rootPath}/${productId}.lic`;
            // Save the license to a file in the root directory
            await fs_1.promises.writeFile(licenseFilePath, licFileContent);
        }
        return {
            ...response,
            message: response.message,
        };
    }
    catch (error) {
        logger.error(`License activation failed: ${error.message}`);
        throw new Error(error.message);
    }
}
exports.activateLicense = activateLicense;
async function checkLatestVersion(productId) {
    const payload = {
        product_id: productId,
    };
    return await callApi('POST', `${process.env.APP_LICENSE_API_URL}/api/latest_version`, JSON.stringify(payload));
}
exports.checkLatestVersion = checkLatestVersion;
async function checkUpdate(productId, currentVersion) {
    const payload = {
        product_id: productId,
        current_version: currentVersion,
    };
    return await callApi('POST', `${process.env.APP_LICENSE_API_URL}/api/check_update`, JSON.stringify(payload));
}
exports.checkUpdate = checkUpdate;
async function downloadUpdate(productId, updateId, version, product, type) {
    try {
        if (!productId || !updateId || !version || !product) {
            throw new Error('Missing required arguments.');
        }
        const licenseFilePath = `${rootPath}/${productId}.lic`;
        const licenseFile = await fs_1.promises.readFile(licenseFilePath, 'utf8');
        const data = {
            license_file: licenseFile,
            license_code: null,
            client_name: null,
        };
        // Call API to download update
        const response = await callApi('POST', `${process.env.APP_LICENSE_API_URL}/api/download_update/main/${updateId}`, JSON.stringify(data), `${product}-${version}`);
        if (!response || response.status === 'fail') {
            logger.error(`Download failed: ${response?.message}`);
            throw new Error(`Download failed: ${response?.message}`);
        }
        if (!response.path) {
            logger.error(`Download failed: No update file path returned.`);
            throw new Error(`Download failed: No update file path returned.`);
        }
        // Check for Prisma folder and generate system report if it exists
        try {
            const hasPrismaFolder = checkForPrismaFolder(response.path);
            if (hasPrismaFolder) {
                await (0, system_1.storeSystemReport)('db', `${product}-${version} has database changes. Please run (npx prisma migrate deploy --preview-feature) to apply the changes.`, false);
            }
        }
        catch (error) {
            logger.error(`Prisma check failed: ${error.message}`);
            throw new Error(`Prisma check failed: ${error.message}`);
        }
        try {
            // Extract the main update
            unzip(response.path, rootPath);
            if (type === 'extension') {
                try {
                    await (0, system_1.updateExtensionQuery)(productId, version);
                }
                catch (error) {
                    logger.error(`Update of extension version failed: ${error.message}`);
                    throw new Error(`Update of extension version failed: ${error.message}`);
                }
            }
            else {
                // Update platform.json with the new version
                const platformFilePath = `${rootPath}/platform.json`;
                const platformContent = await fs_1.promises.readFile(platformFilePath, 'utf8');
                const platformData = JSON.parse(platformContent);
                const productIndex = platformData.findIndex((item) => item.id === productId);
                if (productIndex === -1) {
                    throw new Error(`Product with productId ${productId} not found in platform.json`);
                }
                platformData[productIndex].version = version;
                await fs_1.promises.writeFile(platformFilePath, JSON.stringify(platformData, null, 2));
            }
            // Remove the zip file after successful extraction
            await fs_1.promises.unlink(response.path);
            return {
                message: 'Update downloaded and extracted successfully',
            };
        }
        catch (error) {
            logger.error(`Extraction of update files failed: ${error.message}`);
            throw new Error(`Extraction of update files failed: ${error.message}`);
        }
    }
    catch (error) {
        logger.error(`Download Update Error: ${error.message}`);
        throw new Error(`Download Update Error: ${error.message}`);
    }
}
exports.downloadUpdate = downloadUpdate;
const unzip = (filePath, outPath) => {
    const zip = new adm_zip_1.default(filePath);
    zip.extractAllTo(outPath, true);
};
const checkForPrismaFolder = (zipPath) => {
    const zip = new adm_zip_1.default(zipPath);
    const zipEntries = zip.getEntries();
    for (const zipEntry of zipEntries) {
        if (zipEntry.isDirectory) {
            if (zipEntry.entryName.startsWith('prisma/')) {
                return true;
            }
        }
    }
    return false;
};
