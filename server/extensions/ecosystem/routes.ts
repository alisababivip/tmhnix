export default [
  {
    basePath: '/api/admin/ecosystem/blockchains',
    controllerPath: './extensions/ecosystem/admin/blockchains/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'Access Ecosystem Management',
      },
      {
        method: 'get',
        path: '/:uuid',
        controller: 'show',
        params: ['uuid'],
        permission: 'Access Ecosystem Management',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/blockchains/wallets',
    controllerPath: './extensions/ecosystem/admin/wallets/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/update/balance',
        controller: 'balance',
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/:uuid',
        controller: 'show',
        params: ['uuid'],
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/chain/:chain',
        controller: 'showChain',
        params: ['chain'],
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/:chain/:address/transactions',
        controller: 'transactions',
        params: ['chain', 'address'],
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/:chain/:address/transactions/internal',
        controller: 'internalTransactions',
        params: ['chain', 'address'],
        permission: 'View Ecosystem Master Wallets',
      },
      {
        method: 'get',
        path: '/:uuid/tokens',
        controller: 'tokens',
        params: ['uuid'],
        permission: 'View Ecosystem Tokens',
      },
      {
        method: 'post',
        path: '',
        controller: 'store',
        body: ['chain'],
        permission: 'Create Ecosystem Master Wallets',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/blockchains/custodial',
    controllerPath: './extensions/ecosystem/admin/custodial/controller',
    routes: [
      {
        method: 'get',
        path: '/:chain',
        controller: 'index',
        params: ['chain'],
        permission: 'View Ecosystem Custodial Wallets',
      },
      {
        method: 'get',
        path: '/wallet/:uuid',
        controller: 'show',
        params: ['uuid'],
        permission: 'View Ecosystem Custodial Wallets',
      },
      {
        method: 'get',
        path: '/deploy',
        controller: 'deploy',
        query: ['chain'],
        permission: 'Deploy Ecosystem Custodial Contract',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/blockchains/ledgers',
    controllerPath: './extensions/ecosystem/admin/ledgers/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View Ecosystem Private Ledgers',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/tokens',
    controllerPath: './extensions/ecosystem/admin/tokens/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View Ecosystem Tokens',
        query: ['?filter', '?perPage', '?page'],
      },
      {
        method: 'get',
        path: '/fetch/all',
        controller: 'list',
        permission: 'View Ecosystem Tokens',
      },
      {
        method: 'get',
        path: '/:chain/:currency',
        controller: 'show',
        params: ['chain', 'currency'],
        permission: 'View Ecosystem Tokens',
      },
      {
        method: 'get',
        path: '/:chain/:currency/holders',
        controller: 'holders',
        params: ['chain', 'currency'],
        permission: 'View Ecosystem Token Holders',
      },
      {
        method: 'post',
        path: '',
        controller: 'store',
        body: [
          'chain',
          'name',
          'currency',
          'initialSupply',
          'cap',
          'initialHolder',
          'decimals',
        ],
        permission: 'Create Ecosystem Tokens',
      },
      {
        method: 'post',
        path: '/import',
        controller: 'import',
        body: [
          'name',
          'currency',
          'chain',
          'network',
          'type',
          'contract',
          'decimals',
          'contractType',
        ],
        permission: 'Import Ecosystem Tokens',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['precision', 'limits', 'fees'],
        permission: 'Edit Ecosystem Tokens',
      },
      {
        method: 'put',
        path: '/:id/icon',
        controller: 'updateIcon',
        params: ['id'],
        body: ['icon'],
        permission: 'Edit Ecosystem Tokens',
      },
      {
        method: 'post',
        path: '/update-status',
        controller: 'updateStatus',
        body: ['ids', 'status'],
        permission: 'Edit Ecosystem Tokens',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/kms',
    controllerPath: './extensions/ecosystem/admin/kms/controller',
    routes: [
      {
        method: 'post',
        path: '/set-passphrase',
        controller: 'setPassphrase',
        body: ['passphrase'],
        permission: 'Set Passphrase for HSM',
      },
    ],
  },
  {
    basePath: '/api/admin/ecosystem/markets',
    controllerPath: './extensions/ecosystem/admin/markets/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View Ecosystem Markets',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View Ecosystem Markets',
      },
      {
        method: 'post',
        path: '',
        controller: 'store',
        body: ['currency', 'pair', 'metadata', 'is_trending', 'is_hot'],
        permission: 'Create Ecosystem Markets',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['metadata', 'is_trending', 'is_hot'],
        permission: 'Edit Ecosystem Markets',
      },
      {
        method: 'post',
        path: '/status',
        controller: 'updateStatus',
        body: ['ids', 'status'],
        permission: 'Edit Ecosystem Markets',
      },
      {
        method: 'del',
        path: '/:id',
        controller: 'destroy',
        params: ['id'],
        permission: 'Delete Ecosystem Markets',
      },
      {
        method: 'get',
        path: '/log/orders',
        controller: 'orders',
        query: ['?user', '?symbol', '?status', '?side'],
        permission: 'View Ecosystem Orders',
      },
    ],
  },
  {
    basePath: '/api/ecosystem/wallets',
    controllerPath: './extensions/ecosystem/user/wallets/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        query: ['transactions', 'addresses'],
      },
      {
        method: 'get',
        path: '/:currency',
        controller: 'show',
        params: ['currency'],
      },
      {
        method: 'post',
        path: '/:currency',
        controller: 'store',
        params: ['currency'],
      },
      {
        method: 'get',
        path: '/:chain/address',
        controller: 'depositAddress',
        params: ['chain'],
      },
      {
        method: 'get',
        path: '/:address/unlock-deposit-address',
        controller: 'unlockDepositAddress',
        params: ['address'],
      },
      {
        method: 'post',
        path: '/:uuid/withdraw',
        controller: 'withdraw',
        params: ['uuid'],
        body: ['amount', 'chain', 'toAddress'],
      },
      {
        method: 'post',
        path: '/:uuid/transfer',
        controller: 'transfer',
        params: ['uuid'],
        body: ['amount', 'currency'],
      },
    ],
  },
  {
    basePath: '/api/ecosystem/tokens',
    controllerPath: './extensions/ecosystem/user/tokens/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
      },
      {
        method: 'get',
        path: '/:currency',
        controller: 'show',
        params: ['currency'],
      },
    ],
  },
  {
    basePath: '/api/ecosystem/markets',
    controllerPath: './extensions/ecosystem/user/markets/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        isGuest: true,
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        isGuest: true,
      },
    ],
  },
  {
    basePath: '/api/ecosystem/orders',
    controllerPath: './extensions/ecosystem/user/exchange/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        query: ['symbol'],
      },
      {
        method: 'post',
        path: '',
        controller: 'store',
        body: ['symbol', 'type', 'side', 'amount', 'price'],
      },
      {
        method: 'del',
        path: '/:uuid',
        controller: 'cancel',
        params: ['uuid'],
        body: ['created_at'],
      },
      {
        method: 'get',
        path: '/chart/historical',
        controller: 'getHistorical',
        query: ['symbol', 'from', 'to', 'interval'],
      },
      {
        method: 'get',
        path: '/ticker',
        controller: 'ticker',
        query: ['symbol'],
      },
    ],
  },
]
