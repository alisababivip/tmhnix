"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchTranslate = exports.toggleLocaleStatus = exports.editLocale = exports.controllers = void 0;
const fs_1 = __importDefault(require("fs"));
const controller_1 = require("~~/http/settings/controller");
const queries_1 = require("~~/http/settings/queries");
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_2 = require("./queries");
const { Translate } = require('@google-cloud/translate').v2;
const rootPath = `${process.cwd()}/.app`;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
exports.controllers = {
    update: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_2.updateSettings)(body.data);
            await (0, controller_1.cacheSettings)();
            try {
                const cachedSettings = await redis_1.redis.get('settings');
                if (cachedSettings) {
                    const settings = JSON.parse(cachedSettings);
                    return {
                        ...settings,
                        message: 'Settings updated successfully',
                    };
                }
            }
            catch (err) {
                console.error('Redis error:', err);
            }
            const settings = await (0, queries_1.getSettings)();
            return {
                ...settings,
                message: 'Settings updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    editLocale: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await editLocale(body.code, body.updates);
            return {
                message: 'Locale updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    localeStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await toggleLocaleStatus(body.code, body.status);
            return {
                message: 'Locale updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    localeTranslate: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await batchTranslate(body.keys, body.targetLang);
            return {
                ...response,
                message: 'Locale translated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
async function editLocale(code, updates) {
    const LocaleJsonFilePath = `${rootPath}/data/locales/${code}.json`;
    // Check if the file exists
    if (!fs_1.default.existsSync(LocaleJsonFilePath)) {
        throw new Error(`Locale file for code ${code} does not exist.`);
    }
    const data = fs_1.default.readFileSync(LocaleJsonFilePath, 'utf8');
    let languages;
    try {
        languages = JSON.parse(data);
    }
    catch (e) {
        throw new Error('Failed to parse locale JSON file.');
    }
    // Apply the updates directly to the languages object
    Object.assign(languages, updates);
    fs_1.default.writeFileSync(LocaleJsonFilePath, JSON.stringify(languages, null, 2));
}
exports.editLocale = editLocale;
async function toggleLocaleStatus(code, status) {
    const jsonFilePath = `${rootPath}/data/languages.json`;
    const data = fs_1.default.readFileSync(jsonFilePath, 'utf8');
    const languages = JSON.parse(data);
    const index = languages.findIndex((lang) => lang.code === code);
    if (index !== -1) {
        languages[index].status = status;
        fs_1.default.writeFileSync(jsonFilePath, JSON.stringify(languages, null, 2));
    }
}
exports.toggleLocaleStatus = toggleLocaleStatus;
async function batchTranslate(keysToTranslate, targetLang) {
    const translateInstance = new Translate({
        key: GOOGLE_TRANSLATE_API_KEY,
    });
    const translations = {};
    const sanitizedTargetLang = sanitizeLanguageCode(targetLang);
    try {
        // Perform batch translation
        const translatedTexts = await Promise.all(keysToTranslate.map(async (key) => {
            const [translated] = await translateInstance.translate(key, sanitizedTargetLang);
            return translated;
        }));
        // Map translations back to their original keys
        keysToTranslate.forEach((key, index) => {
            translations[key] = translatedTexts[index];
        });
        return translations;
    }
    catch (error) {
        throw new Error(error.message);
    }
}
exports.batchTranslate = batchTranslate;
// Function to sanitize language codes
function sanitizeLanguageCode(code) {
    const mapping = {
        cn: 'zh',
        mx: 'es',
    };
    return mapping[code] || code;
}
