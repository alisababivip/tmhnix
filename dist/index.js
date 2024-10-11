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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tsconfigPaths = __importStar(require("tsconfig-paths"));
const uWS = __importStar(require("uWebSockets.js"));
const exchange_1 = require("./exchange");
const logger_1 = require("./logger");
const routes_1 = require("./routes");
const apiDocsSetup_1 = require("./tools/apiDocsSetup");
const chat_1 = require("./tools/chat");
const htmlSetup_1 = require("./tools/htmlSetup");
const utils_1 = require("./utils");
const logger = (0, logger_1.createLogger)('uWS-Server');
const app = uWS.App();
const isProduction = process.env.NODE_ENV === 'production';
const fileExtension = isProduction ? '.js' : '.ts';
const baseUrl = path.join(process.cwd(), isProduction ? '/dist' : '/server');
const routeHandlerCache = new Map();
const cleanup = tsconfigPaths.register({
    baseUrl,
    paths: { '~~/*': ['./*'] },
});
require("./tools/apiDocsGenerate");
// import './tools/permissionsGenerate'
const isValidMethod = (method) => typeof app[method] === 'function';
const setupIndividualRoute = (basePath, route, controllers) => {
    if (isValidMethod(route.method)) {
        const fullPath = `${basePath}${route.path}`;
        app[route.method](fullPath, (0, utils_1.setupRouteHandler)(route, controllers));
    }
    else {
        logger.error(`Invalid method ${route.method} for route ${route.path}`);
    }
};
const getValidAddonFolders = () => {
    return utils_1.validAddonFolders.filter((folderName) => {
        const fullPath = path.join(baseUrl, 'extensions', folderName);
        return fs.existsSync(fullPath);
    });
};
const setupRouteGroup = async (group) => {
    const { basePath, routes, controllerPath } = group;
    const fullControllerPath = path.resolve(baseUrl, `${controllerPath}${fileExtension}`);
    if (routeHandlerCache.has(fullControllerPath)) {
        const controllers = routeHandlerCache.get(fullControllerPath);
        routes.forEach((route) => setupIndividualRoute(basePath, route, controllers));
        return;
    }
    if (!fs.existsSync(fullControllerPath)) {
        logger.error(`Controller file does not exist: ${fullControllerPath}`);
        return;
    }
    try {
        const mod = await Promise.resolve(`${fullControllerPath}`).then(s => __importStar(require(s)));
        const controllers = mod.controllers;
        routeHandlerCache.set(fullControllerPath, controllers);
        routes.forEach((route) => setupIndividualRoute(basePath, route, controllers));
    }
    catch (error) {
        logger.error(`Failed to import controllers from ${fullControllerPath}: ${error}`);
    }
};
const setupRoutes = async () => {
    console.time('SetupRoutes Duration');
    const addonFolders = getValidAddonFolders();
    const setupPromises = routes_1.routeGroups.map(setupRouteGroup);
    addonFolders.forEach((folder) => {
        const addonRoutePath = `${baseUrl}/extensions/${folder}/routes${fileExtension}`;
        try {
            const addonRouteGroups = require(addonRoutePath).default;
            setupPromises.push(...addonRouteGroups.map(setupRouteGroup));
        }
        catch (error) {
            logger.error(`Failed to import addon routes from ${addonRoutePath}: ${error}`);
        }
    });
    await Promise.all(setupPromises);
    console.timeEnd('SetupRoutes Duration');
};
const setupEcosystemWebsocketIfAvailable = async () => {
    const filePath = path.join(__dirname, 'extensions', 'ecosystem', 'websocket', `index${fileExtension}`); // Adjust the path as needed
    if (fs.existsSync(filePath)) {
        try {
            // Using a variable to make TypeScript treat this as a dynamic import
            const moduleName = `./extensions/ecosystem/websocket${process.env.NODE_ENV === 'production' ? '/index.js' : ''}`;
            const ecosystemModule = await Promise.resolve(`${moduleName}`).then(s => __importStar(require(s)));
            if (ecosystemModule &&
                typeof ecosystemModule.setupEcosystemWebsocket === 'function') {
                ecosystemModule.setupEcosystemWebsocket(app);
            }
        }
        catch (error) {
            console.log('Ecosystem websocket setup failed:', error);
        }
    }
    else {
        console.log('Ecosystem websocket module does not exist.');
    }
};
// Handle OPTIONS for all routes
app.options('/*', (res, req) => {
    res.cork(() => {
        (0, utils_1.setCORSHeaders)(res);
        res.writeStatus('204 No Content');
        res.end();
    });
});
const initializeApp = async () => {
    try {
        (0, apiDocsSetup_1.setupApiDocsRoutes)(app);
        (0, htmlSetup_1.setupHtmlRoutes)(app);
        (0, exchange_1.setupExchangeWebsocket)(app);
        (0, chat_1.setupChat)(app);
        await setupEcosystemWebsocketIfAvailable();
        await setupRoutes();
        app.listen(4000, (token) => {
            if (token) {
                logger.info('Server started on port 4000');
            }
            else {
                logger.error('Failed to start server');
            }
        });
    }
    catch (error) {
        logger.error(`Failed to initialize app: ${error}`);
        // Perform any necessary cleanup
        cleanup();
        process.exit(1); // Exit with error code
    }
};
initializeApp().catch((error) => {
    logger.error(`Failed to initialize app: ${error}`);
});
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
process.on('SIGINT', async () => {
    try {
        logger.info('Server is shutting down...');
        cleanup();
    }
    catch (error) {
        logger.error(`Error during shutdown: ${error}`);
    }
    finally {
        process.exit(); // Exit after cleanup
    }
});
