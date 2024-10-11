"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    // Admin routes for Staking Pools
    {
        basePath: '/api/admin/staking/analytics',
        controllerPath: './extensions/staking/admin/analytics/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Staking Management',
            },
        ],
    },
    // Admin routes for Staking Pools
    {
        basePath: '/api/admin/staking/pools',
        controllerPath: './extensions/staking/admin/pools/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Staking Pools',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Staking Pool',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: [
                    'name',
                    'currency',
                    'chain',
                    'type',
                    'min_stake',
                    'max_stake',
                    'status',
                    'description',
                ],
                permission: 'Create Staking Pool',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: [
                    'name',
                    'currency',
                    'chain',
                    'type',
                    'min_stake',
                    'max_stake',
                    'status',
                    'description',
                ],
                permission: 'Update Staking Pool',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Staking Pool',
            },
        ],
    },
    // User routes for Staking Pools
    {
        basePath: '/api/staking/pools',
        controllerPath: './extensions/staking/user/pools/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
            },
        ],
    },
    // Admin routes for Staking Durations
    {
        basePath: '/api/admin/staking/durations',
        controllerPath: './extensions/staking/admin/durations/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Staking Durations',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Staking Duration',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['pool_id', 'duration', 'interest_rate'],
                permission: 'Create Staking Duration',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['duration', 'interest_rate'],
                permission: 'Update Staking Duration',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Staking Duration',
            },
        ],
    },
    // Admin routes for Staking Logs
    {
        basePath: '/api/admin/staking/logs',
        controllerPath: './extensions/staking/admin/logs/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Staking Logs',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Staking Log',
            },
        ],
    },
    {
        basePath: '/api/staking',
        controllerPath: './extensions/staking/user/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
            },
            {
                method: 'post',
                path: '/stake',
                controller: 'stake',
                body: ['pool_id', 'amount', 'duration_id'],
            },
            {
                method: 'post',
                path: '/withdraw',
                controller: 'withdraw',
                body: ['stake_id'],
            },
        ],
    },
    {
        basePath: '/api/cron/staking',
        controllerPath: './extensions/staking/user/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'cron',
                isGuest: true,
            },
        ],
    },
];
