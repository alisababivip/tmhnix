"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolesAndPermissionsCache = exports.loadRolesAndPermissions = void 0;
const prisma_1 = __importDefault(require("./prisma"));
let rolesAndPermissionsCache = {};
const loadRolesAndPermissions = async () => {
    try {
        const rolesWithPermissions = await prisma_1.default.role.findMany({
            include: {
                rolepermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        const cache = rolesWithPermissions.reduce((acc, role) => {
            acc[role.id] = {
                name: role.name,
                permissions: role.rolepermission.map((rp) => rp.permission.name),
            };
            return acc;
        }, {});
        rolesAndPermissionsCache = cache;
    }
    catch (error) {
        console.error('Failed to load roles and permissions:', error);
    }
};
exports.loadRolesAndPermissions = loadRolesAndPermissions;
const getRolesAndPermissionsCache = () => {
    return rolesAndPermissionsCache;
};
exports.getRolesAndPermissionsCache = getRolesAndPermissionsCache;
// Load the roles and permissions into cache on startup.
(0, exports.loadRolesAndPermissions)();
