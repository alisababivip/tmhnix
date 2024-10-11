"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validAddonFolders = exports.createError = exports.handleController = exports.setupRouteHandler = exports.sendResponse = exports.setCORSHeaders = void 0;
// utils.ts
const zlib = __importStar(require("zlib"));
const extract_1 = require("./extract");
const middleware_1 = require("./middleware");
const commonHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
};
const setCORSHeaders = (res) => {
    res.writeHeader('Access-Control-Allow-Origin', process.env.APP_PUBLIC_URL + ':3000');
    res.writeHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.writeHeader('Access-Control-Allow-Headers', '*, client-platform, access-token, refresh-token, session-id, csrf-token, content-type');
    res.writeHeader('Access-Control-Allow-Credentials', 'true');
};
exports.setCORSHeaders = setCORSHeaders;
function sendResponse(res, status, data, message, error, req) {
    if (res.aborted) {
        return;
    }
    if (!res.abortedHandlerAttached) {
        res.onAborted(() => {
            res.aborted = true;
        });
        res.abortedHandlerAttached = true;
    }
    let response;
    if (status === 'success') {
        response = {
            status: 'success',
            data: {
                result: data || null,
                message: message || data?.message || null,
            },
        };
    }
    else {
        response = {
            status: 'fail',
            error: error,
        };
    }
    const responseStr = JSON.stringify(response);
    // Compress the JSON string using Gzip
    zlib.gzip(responseStr, (err, buffer) => {
        if (err) {
            console.error('Error compressing response:', err);
            return;
        }
        res.cork(() => {
            if (res.aborted) {
                return;
            }
            // Set CORS headers
            (0, exports.setCORSHeaders)(res);
            // Set common headers
            for (const [key, value] of Object.entries(commonHeaders)) {
                res.writeHeader(key, value);
            }
            // Write secure cookies if applicable
            if (req &&
                Object.keys(req.tokens).length > 0 &&
                req.url.startsWith('/api/auth')) {
                (0, middleware_1.writeSecureCookies)(res, req);
            }
            // Set Content-Encoding header to indicate Gzip compression
            res.writeHeader('Content-Encoding', 'gzip');
            // Send the compressed buffer
            res.end(buffer);
        });
    });
}
exports.sendResponse = sendResponse;
// Function to setup the route handler
const setupRouteHandler = (route, controllers) => {
    const paramIndices = (0, extract_1.calculateParamIndices)(route.path); // Calculate once, outside of the function
    return async (res, req) => {
        // Handle aborted requests
        res.onAborted(() => {
            res.aborted = true;
        });
        // Initialize request context
        const context = {
            originalReq: req,
            user: null,
            tokens: {},
            headers: [],
            platform: null,
            url: req.getUrl(),
            method: route.method === 'del' ? 'DELETE' : route.method.toUpperCase(),
        };
        // Check if route allows guest access
        const isGuest = route.isGuest ?? false;
        try {
            // Extract required data from the request
            const { params, query, body, error } = await (0, extract_1.extractData)(route.method.toLowerCase(), route, res, req, context, paramIndices);
            // If data extraction resulted in an error, throw it
            if (error)
                throw error;
            // Validate user and permissions
            await (0, middleware_1.validateUserAndPermissions)(context, route, isGuest);
            // Retrieve and invoke the controller function
            const controllerFn = controllers[route.controller];
            if (typeof controllerFn === 'function') {
                try {
                    await controllerFn(res, context, params, query, body);
                }
                catch (e) {
                    console.error('Error invoking controller:', e);
                    sendResponse(res, 'fail', null, 'An unexpected error occurred', { status: 500, message: 'Controller not found' }, context);
                }
            }
            else {
                console.error(`Controller function of ${route.controller}: Not found`);
                sendResponse(res, 'fail', null, 'An unexpected error occurred', { status: 500, message: 'Controller not found' }, context);
            }
        }
        catch (error) {
            sendResponse(res, 'fail', null, error.message, {
                status: error.statusCode || 400,
                message: error.message,
            }, context);
            return;
        }
    };
};
exports.setupRouteHandler = setupRouteHandler;
const handleCookies = (data, req) => {
    const { cookies, message, ...restData } = data;
    if (req.tokens) {
        req.tokens = {
            ...req.tokens,
            'access-token': cookies['access-token'],
            'refresh-token': cookies['refresh-token'],
            'session-id': cookies['session-id'],
            'csrf-token': cookies['csrf-token'],
        };
    }
    return { restData, message };
};
const handleResponse = (res, data, req) => {
    if (data.cookies && req?.tokens) {
        const { restData, message } = handleCookies(data, req);
        sendResponse(res, 'success', restData, message, null, req);
    }
    else if (data.message) {
        const { message, ...restData } = data;
        sendResponse(res, 'success', restData, message, null, req);
    }
    else {
        sendResponse(res, 'success', data, 'Operation successful', null, req);
    }
};
const handleController = (action) => async (res, req, params, query, body) => {
    try {
        const data = await action(res, req, params, query, body, req.user);
        if (data) {
            handleResponse(res, data, req);
        }
        else {
            sendResponse(res, 'success', null, 'Operation successful', null, req);
        }
    }
    catch (error) {
        const status = error instanceof CustomError ? error.statusCode : 500;
        const message = error instanceof CustomError
            ? error.statusMessage
            : 'An unexpected error occurred';
        sendResponse(res, 'fail', null, message, {
            status,
            message: error.message,
        }, req);
    }
};
exports.handleController = handleController;
class CustomError extends Error {
    statusCode;
    statusMessage;
    constructor({ statusCode, statusMessage }) {
        super(statusMessage);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        // This ensures that the CustomError is an instance of Error, which is important for proper error handling
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function createError(options) {
    return new CustomError(options);
}
exports.createError = createError;
exports.validAddonFolders = [
    'ai-trading',
    'ecommerce',
    'ecosystem',
    'faq',
    'forex',
    'ico',
    'mlm',
    'p2p',
    'staking',
    'mailwizard',
];
