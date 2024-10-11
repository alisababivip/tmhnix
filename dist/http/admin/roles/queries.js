"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPermissions = exports.deleteRoles = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRole = exports.getRoles = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getRoles() {
    return (await prisma_1.default.role.findMany({
        include: {
            rolepermission: {
                include: {
                    permission: true,
                },
            },
        },
    }));
}
exports.getRoles = getRoles;
async function getRole(id) {
    return (await prisma_1.default.role.findUnique({
        where: {
            id: id,
        },
        include: {
            rolepermission: {
                include: {
                    permission: true,
                },
            },
        },
    }));
}
exports.getRole = getRole;
async function createRole(data) {
    try {
        return (await prisma_1.default.role.create({
            data: data,
        }));
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('role_name_key')) {
            throw new Error('Role with this name already exists');
        }
        throw error;
    }
}
exports.createRole = createRole;
async function updateRole(id, data) {
    try {
        return (await prisma_1.default.role.update({
            where: {
                id: id,
            },
            data: data,
        }));
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('role_name_key')) {
            throw new Error('Role with this name already exists');
        }
        throw error;
    }
}
exports.updateRole = updateRole;
async function deleteRole(id) {
    const deleteRolePermission = prisma_1.default.rolepermission.deleteMany({
        where: {
            role_id: id,
        },
    });
    const deleteRole = prisma_1.default.role.delete({
        where: {
            id: id,
        },
    });
    await prisma_1.default.$transaction([deleteRolePermission, deleteRole]);
}
exports.deleteRole = deleteRole;
async function deleteRoles(ids) {
    const deleteRolePermission = prisma_1.default.rolepermission.deleteMany({
        where: {
            role_id: { in: ids },
        },
    });
    const deleteRole = prisma_1.default.role.deleteMany({
        where: {
            id: { in: ids },
        },
    });
    await prisma_1.default.$transaction([deleteRolePermission, deleteRole]);
}
exports.deleteRoles = deleteRoles;
async function syncPermissions(id, permissions) {
    const role = await prisma_1.default.role.findUnique({
        where: { id: id },
        include: { rolepermission: true },
    });
    if (!role)
        throw new Error('Role not found');
    const existingPermissionIds = role.rolepermission.map((rp) => rp.permission_id);
    const newPermissionIds = permissions.map((perm) => perm.id);
    // Find the permissions to be added and removed
    const toBeAdded = newPermissionIds.filter((permId) => !existingPermissionIds.includes(permId));
    const toBeRemoved = existingPermissionIds.filter((permId) => !newPermissionIds.includes(permId));
    // Remove obsolete permissions
    if (toBeRemoved.length > 0) {
        await prisma_1.default.rolepermission.deleteMany({
            where: {
                role_id: id,
                permission_id: { in: toBeRemoved },
            },
        });
    }
    // Add new permissions
    if (toBeAdded.length > 0) {
        await prisma_1.default.role.update({
            where: { id: id },
            data: {
                rolepermission: {
                    create: toBeAdded.map((permId) => ({
                        permission_id: permId,
                    })),
                },
            },
        });
    }
    // Get the updated role
    const updatedRole = await getRole(id);
    return updatedRole;
}
exports.syncPermissions = syncPermissions;
