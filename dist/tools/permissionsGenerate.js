"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("~~/routes"); // Replace with your actual core routes
const utils_1 = require("~~/utils");
// Initialize an empty permissions array
const permissions = [];
const rootPath = path_1.default.resolve(process.cwd(), 'prisma', 'seed');
// Function to extract permissions from route groups
const extractPermissions = (routeGroups) => {
    if (!routeGroups) {
        console.warn('No route groups found');
        return;
    }
    routeGroups.forEach((group) => {
        if (!group.routes) {
            console.warn('No routes found in group');
            return;
        }
        group.routes.forEach((route) => {
            if (route.permission && !permissions.includes(route.permission)) {
                console.log(`New permission added: ${route.permission}`);
                permissions.push(route.permission);
            }
        });
    });
};
// Extract permissions from core routes
extractPermissions(routes_1.routeGroups);
// Define the extensions directory
const extensionsDir = path_1.default.resolve(process.cwd(), 'server', 'extensions');
// Read the list of extensions
let extensionNames;
try {
    extensionNames = fs_1.default.readdirSync(extensionsDir);
}
catch (error) {
    console.error(`Error reading extensions directory: ${error}`);
    extensionNames = [];
}
// Extract permissions from each extension's routes
utils_1.validAddonFolders.forEach((extension) => {
    try {
        const extensionRoutesPath = path_1.default.resolve(extensionsDir, extension, `routes.ts`);
        if (fs_1.default.existsSync(extensionRoutesPath)) {
            const extensionRoutes = require(extensionRoutesPath).default;
            extractPermissions(extensionRoutes);
        }
        else {
            console.warn(`No routes.ts found for extension ${extension}`);
        }
    }
    catch (error) {
        console.error(`Error reading routes for extension ${extension}: ${error}`);
    }
});
// Convert array to JSON string
const permissionsJSON = JSON.stringify(permissions, null, 2);
// Write to a file
fs_1.default.writeFileSync(path_1.default.resolve(rootPath, 'permissions.json'), permissionsJSON);
console.log('Permissions JSON file has been generated.');
