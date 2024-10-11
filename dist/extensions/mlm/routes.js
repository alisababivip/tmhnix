"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        basePath: '/api/admin/affiliate',
        controllerPath: './extensions/mlm/admin/controller',
        routes: [
            {
                method: 'get',
                path: '/analytics',
                controller: 'analytics',
                permission: 'Access MLM Management',
            },
        ],
    },
    {
        basePath: '/api/affiliate/referrals',
        controllerPath: './extensions/mlm/user/referral/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/list',
                controller: 'list',
            },
            {
                method: 'get',
                path: '/analytics',
                controller: 'analytics',
            },
        ],
    },
    {
        basePath: '/api/admin/affiliate/referral',
        controllerPath: './extensions/mlm/admin/referral/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View MLM Referrals',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View MLM Referrals',
            },
            {
                method: 'get',
                path: '/nodes',
                controller: 'nodes',
                permission: 'View MLM Referrals',
            },
            {
                method: 'get',
                path: '/nodes/:uuid',
                controller: 'node',
                params: ['uuid'],
                permission: 'View MLM Referrals',
            },
            {
                method: 'put',
                path: '/:id/status',
                controller: 'updateStatus',
                params: ['id'],
                body: ['status'],
                permission: 'Edit MLM Referrals',
            },
            {
                method: 'get',
                path: '/stats',
                controller: 'referralStats',
                permission: 'Edit MLM Referrals',
            },
        ],
    },
    {
        basePath: '/api/affiliate/rewards',
        controllerPath: './extensions/mlm/user/rewards/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'post',
                path: '/:uuid/claim',
                controller: 'claim',
                params: ['uuid'],
            },
        ],
    },
    {
        basePath: '/api/admin/affiliate/rewards',
        controllerPath: './extensions/mlm/admin/rewards/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View MLM Rewards',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['type', 'reward'],
                permission: 'Edit MLM Reward',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete MLM Reward',
            },
        ],
    },
    {
        basePath: '/api/admin/affiliate/conditions',
        controllerPath: './extensions/mlm/admin/conditions/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View MLM Conditions',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View MLM Conditions',
            },
            {
                method: 'put',
                path: '/:id/status',
                controller: 'updateStatus',
                params: ['id'],
                permission: 'Edit MLM Conditions',
                body: ['status'],
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: [
                    'title',
                    'description',
                    'reward',
                    'reward_type',
                    'reward_currency',
                ],
                permission: 'Edit MLM Conditions',
            },
        ],
    },
];
