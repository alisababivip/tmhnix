-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(60) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `avatar` VARCHAR(1000) NULL,
    `first_name` VARCHAR(255) NULL,
    `last_name` VARCHAR(255) NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(255) NULL,
    `role_id` INTEGER NOT NULL DEFAULT 1,
    `metadata` JSON NULL,
    `notifications` JSON NULL,
    `last_login` DATETIME(0) NULL,
    `last_failed_login` DATETIME(0) NULL,
    `failed_login_attempts` INTEGER NULL DEFAULT 0,
    `wallet_address` VARCHAR(255) NULL,
    `wallet_provider` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED') NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `uuid`(`uuid`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `user_wallet_address_key`(`wallet_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mlm_referral` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'ACTIVE', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `referrerUuid` VARCHAR(191) NOT NULL,
    `referredUuid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mlm_referral_referredUuid_key`(`referredUuid`),
    UNIQUE INDEX `mlm_referral_referrerUuid_referredUuid_key`(`referrerUuid`, `referredUuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mlm_binary_node` (
    `id` VARCHAR(191) NOT NULL,
    `referral_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `left_child_id` VARCHAR(191) NULL,
    `right_child_id` VARCHAR(191) NULL,

    UNIQUE INDEX `mlm_binary_node_referral_id_key`(`referral_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mlm_unilevel_node` (
    `id` VARCHAR(191) NOT NULL,
    `referral_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,

    UNIQUE INDEX `mlm_unilevel_node_referral_id_key`(`referral_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mlm_referral_reward` (
    `id` VARCHAR(191) NOT NULL,
    `reward` DOUBLE NOT NULL,
    `is_claimed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `condition_id` VARCHAR(191) NOT NULL,
    `referrerUuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mlm_referral_condition` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('DEPOSIT', 'TRADE', 'INVESTENT', 'AI_INVESTMENT', 'FOREX_INVESTMENT', 'ICO_CONTRIBUTION', 'STAKING', 'ECOMMERCE_PURCHASE', 'P2P_TRADE') NOT NULL,
    `reward` DOUBLE NOT NULL,
    `reward_type` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `reward_wallet_type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL,
    `reward_currency` VARCHAR(191) NOT NULL,
    `reward_chain` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `mlm_referral_condition_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `access_token` VARCHAR(4000) NOT NULL,
    `csrf_token` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `sid`(`sid`),
    INDEX `Session_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(255) NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `notifications_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provideruser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` ENUM('GOOGLE') NOT NULL,
    `provider_user_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `provider_user_id`(`provider_user_id`),
    INDEX `ProviderUser_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `onetimetoken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_id` VARCHAR(60) NOT NULL,
    `token_type` ENUM('RESET') NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `date_created` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `token_id`(`token_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refreshtokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `token_id`(`token_id`),
    INDEX `RefreshTokens_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rolepermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    INDEX `RolePermission_permission_id_fkey`(`permission_id`),
    INDEX `RolePermission_role_id_fkey`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_key` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `api_key_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `inOrder` DOUBLE NULL DEFAULT 0,
    `addresses` JSON NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallet_uuid_key`(`uuid`),
    UNIQUE INDEX `wallet_user_id_currency_type_key`(`user_id`, `currency`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `chain` VARCHAR(255) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `index` INTEGER NOT NULL,
    `data` JSON NOT NULL,

    UNIQUE INDEX `wallet_data_wallet_id_currency_chain_key`(`wallet_id`, `currency`, `chain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_utxo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `transaction_id` VARCHAR(255) NOT NULL,
    `index` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `script` VARCHAR(1000) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ecosystem_utxo_wallet_id_idx`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_master_wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(255) NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `data` JSON NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `last_index` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ecosystem_master_wallet_uuid_key`(`uuid`),
    UNIQUE INDEX `ecosystem_master_wallet_chain_currency_key`(`chain`, `currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_custodial_wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `master_wallet_id` INTEGER NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `chain` VARCHAR(255) NOT NULL,
    `network` VARCHAR(255) NOT NULL DEFAULT 'mainnet',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ecosystem_custodial_wallet_uuid_key`(`uuid`),
    UNIQUE INDEX `ecosystem_custodial_wallet_address_key`(`address`),
    INDEX `custodial_wallet_master_wallet_id_idx`(`master_wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `chain` VARCHAR(255) NOT NULL,
    `network` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `decimals` INTEGER NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `precision` INTEGER NULL DEFAULT 8,
    `limits` JSON NULL,
    `fees` JSON NULL,
    `icon` VARCHAR(1000) NULL,
    `contractType` ENUM('PERMIT', 'NO_PERMIT', 'NATIVE') NOT NULL DEFAULT 'PERMIT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ecosystem_token_contract_chain_key`(`contract`, `chain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_market` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `pair` VARCHAR(191) NOT NULL,
    `is_trending` BOOLEAN NULL DEFAULT false,
    `is_hot` BOOLEAN NULL DEFAULT false,
    `metadata` JSON NULL,
    `status` BOOLEAN NOT NULL,

    UNIQUE INDEX `ecosystem_market_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecosystem_private_ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `index` INTEGER NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `chain` VARCHAR(255) NOT NULL,
    `network` VARCHAR(255) NOT NULL DEFAULT 'mainnet',
    `offchain_difference` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `ecosystem_private_ledger_wallet_id_index_currency_chain_netw_key`(`wallet_id`, `index`, `currency`, `chain`, `network`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `type` ENUM('FAILED', 'DEPOSIT', 'WITHDRAW', 'OUTGOING_TRANSFER', 'INCOMING_TRANSFER', 'PAYMENT', 'REFUND', 'BINARY_ORDER', 'EXCHANGE_ORDER', 'INVESTMENT', 'INVESTMENT_ROI', 'AI_INVESTMENT', 'AI_INVESTMENT_ROI', 'INVOICE', 'FOREX_DEPOSIT', 'FOREX_WITHDRAW', 'FOREX_INVESTMENT', 'FOREX_INVESTMENT_ROI', 'ICO_CONTRIBUTION', 'REFERRAL_REWARD', 'STAKING', 'STAKING_REWARD', 'P2P_OFFER_TRANSFER', 'P2P_TRADE') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REJECTED', 'REFUNDED', 'TIMEOUT') NOT NULL DEFAULT 'PENDING',
    `amount` DOUBLE NOT NULL,
    `fee` DOUBLE NULL DEFAULT 0,
    `description` TEXT NULL,
    `metadata` JSON NULL,
    `reference_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `transaction_uuid_key`(`uuid`),
    UNIQUE INDEX `transaction_reference_id_key`(`reference_id`),
    INDEX `transaction_wallet_id_foreign`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('UNPAID', 'PAID', 'CANCELLED') NOT NULL,
    `transaction_id` INTEGER NULL,
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `due_date` DATETIME(3) NULL,

    INDEX `invoice_sender_id_foreign`(`sender_id`),
    INDEX `invoice_receiver_id_foreign`(`receiver_id`),
    INDEX `invoice_transaction_id_foreign`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `twofactor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `type` ENUM('EMAIL', 'SMS', 'APP') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `twofactor_user_id_key`(`user_id`),
    INDEX `two_factor_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `author` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `author_uuid_key`(`uuid`),
    UNIQUE INDEX `author_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `image` TEXT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `author_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `comments_post_id_foreign`(`post_id`),
    INDEX `comments_author_id_foreign`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `post_tag_post_id_foreign`(`post_id`),
    INDEX `post_tag_tag_id_foreign`(`tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `category_id` INTEGER NOT NULL,
    `author_id` INTEGER NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PUBLISHED', 'DRAFT', 'TRASH') NOT NULL DEFAULT 'DRAFT',
    `image` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `post_slug_key`(`slug`),
    INDEX `posts_category_id_foreign`(`category_id`),
    INDEX `posts_author_id_foreign`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `username` VARCHAR(191) NULL,
    `licenseStatus` BOOLEAN NULL DEFAULT false,
    `version` VARCHAR(191) NULL DEFAULT '0.0.1',
    `productId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL DEFAULT 'spot',

    UNIQUE INDEX `exchange_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_market` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `pair` VARCHAR(191) NOT NULL,
    `is_trending` BOOLEAN NULL DEFAULT false,
    `is_hot` BOOLEAN NULL DEFAULT false,
    `metadata` JSON NULL,
    `status` BOOLEAN NOT NULL,

    UNIQUE INDEX `exchange_market_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `precision` DOUBLE NOT NULL,
    `price` DOUBLE NULL,
    `status` BOOLEAN NOT NULL,
    `chains` JSON NULL,

    UNIQUE INDEX `exchange_currency_currency_key`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `reference_id` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'CANCELED', 'EXPIRED', 'REJECTED') NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `type` ENUM('MARKET', 'LIMIT') NOT NULL,
    `timeInForce` ENUM('GTC', 'IOC', 'FOK', 'PO') NOT NULL,
    `side` ENUM('BUY', 'SELL') NOT NULL,
    `price` DOUBLE NOT NULL,
    `average` DOUBLE NULL,
    `amount` DOUBLE NOT NULL,
    `filled` DOUBLE NOT NULL,
    `remaining` DOUBLE NOT NULL,
    `cost` DOUBLE NOT NULL,
    `trades` JSON NULL,
    `fee` DOUBLE NOT NULL,
    `fee_currency` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exchange_orders_uuid_key`(`uuid`),
    UNIQUE INDEX `exchange_orders_reference_id_key`(`reference_id`),
    INDEX `exchange_orders_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_watchlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `type` ENUM('TRADE', 'BINARY', 'AI_TRADING', 'FOREX', 'STOCK', 'FUTURES') NOT NULL DEFAULT 'TRADE',

    INDEX `exchange_watchlist_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `binary_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `profit` DOUBLE NOT NULL,
    `side` ENUM('RISE', 'FALL') NOT NULL,
    `type` ENUM('RISE_FALL') NOT NULL,
    `status` ENUM('PENDING', 'WIN', 'LOSS', 'DRAW', 'CANCELLED', 'REJECTED', 'EXPIRED') NOT NULL,
    `is_demo` BOOLEAN NOT NULL DEFAULT false,
    `closed_at` DATETIME(3) NOT NULL,
    `close_price` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `binary_orders_uuid_key`(`uuid`),
    INDEX `binary_orders_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdraw_method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `processing_time` VARCHAR(255) NOT NULL,
    `instructions` TEXT NOT NULL,
    `image` VARCHAR(1000) NULL,
    `fixed_fee` DOUBLE NOT NULL DEFAULT 0.00,
    `percentage_fee` DOUBLE NOT NULL DEFAULT 0.00,
    `min_amount` DOUBLE NOT NULL DEFAULT 0.00,
    `max_amount` DOUBLE NOT NULL,
    `custom_fields` JSON NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deposit_method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `instructions` TEXT NOT NULL,
    `image` VARCHAR(1000) NULL,
    `fixed_fee` DOUBLE NOT NULL DEFAULT 0.00,
    `percentage_fee` DOUBLE NOT NULL DEFAULT 0.00,
    `min_amount` DOUBLE NOT NULL DEFAULT 0.00,
    `max_amount` DOUBLE NOT NULL,
    `custom_fields` JSON NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investment_plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `currency` ENUM('AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BYR', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF', 'CLP', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LVL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMK', 'ZMW', 'ZWL') NOT NULL DEFAULT 'USD',
    `min_amount` DOUBLE NOT NULL,
    `max_amount` DOUBLE NOT NULL,
    `roi` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `investment_plan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `roi` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `investment_uuid_key`(`uuid`),
    INDEX `investment_user_id_foreign`(`user_id`),
    INDEX `investment_plan_id_foreign`(`plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `agent_id` INTEGER NULL,
    `messages` JSON NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `support_chat_uuid_key`(`uuid`),
    INDEX `messages_user_id_foreign`(`user_id`),
    INDEX `agent_id`(`agent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `chat_id` INTEGER NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `importance` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    `status` ENUM('PENDING', 'OPEN', 'REPLIED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `support_ticket_uuid_key`(`uuid`),
    INDEX `support_ticket_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `description` TEXT NULL,
    `image` TEXT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `status` ENUM('PUBLISHED', 'DRAFT') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `precision` DOUBLE NOT NULL,
    `price` DOUBLE NULL,
    `status` BOOLEAN NOT NULL,

    UNIQUE INDEX `currency_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deposit_gateway` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(1000) NULL,
    `alias` VARCHAR(191) NULL,
    `currencies` JSON NULL,
    `fixed_fee` DOUBLE NULL DEFAULT 0.00,
    `percentage_fee` DOUBLE NULL DEFAULT 0.00,
    `min_amount` DOUBLE NULL DEFAULT 0.00,
    `max_amount` DOUBLE NULL,
    `type` ENUM('FIAT', 'CRYPTO') NOT NULL DEFAULT 'FIAT',
    `status` BOOLEAN NULL DEFAULT false,
    `version` VARCHAR(191) NULL DEFAULT '0.0.1',
    `productId` VARCHAR(191) NULL,

    UNIQUE INDEX `deposit_gateway_name_key`(`name`),
    UNIQUE INDEX `deposit_gateway_alias_key`(`alias`),
    UNIQUE INDEX `deposit_gateway_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `options` JSON NULL,
    `status` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `kyc_template_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `template_id` INTEGER NOT NULL,
    `data` JSON NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `level` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kyc_user_id_key`(`user_id`),
    INDEX `kyc_user_id_foreign`(`user_id`),
    INDEX `kyc_template_id_foreign`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_health` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `notes` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_health_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extension` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `link` VARCHAR(191) NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `version` VARCHAR(191) NULL DEFAULT '0.0.1',
    `image` VARCHAR(1000) NULL,

    UNIQUE INDEX `extension_product_id_key`(`product_id`),
    UNIQUE INDEX `extension_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `email_body` TEXT NULL,
    `sms_body` TEXT NULL,
    `push_body` TEXT NULL,
    `short_codes` JSON NULL,
    `email` BOOLEAN NULL DEFAULT false,
    `sms` BOOLEAN NULL DEFAULT false,
    `push` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `notification_templates_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `frontend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` JSON NULL,
    `status` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `frontend_section_key`(`section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trading_plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(1000) NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `invested` INTEGER NOT NULL DEFAULT 0,
    `profit_percentage` DOUBLE NOT NULL DEFAULT 0.00,
    `min_profit` DOUBLE NOT NULL,
    `max_profit` DOUBLE NOT NULL,
    `min_amount` DOUBLE NOT NULL DEFAULT 0.00,
    `max_amount` DOUBLE NOT NULL,
    `trending` BOOLEAN NULL DEFAULT false,
    `default_profit` DOUBLE NOT NULL,
    `default_result` ENUM('WIN', 'LOSS', 'DRAW') NOT NULL,

    UNIQUE INDEX `ai_trading_plan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `duration_id` INTEGER NULL,
    `market` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `profit` DOUBLE NULL,
    `result` ENUM('WIN', 'LOSS', 'DRAW') NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ai_trading_uuid_key`(`uuid`),
    INDEX `ai_trading_user_id_foreign`(`user_id`),
    INDEX `ai_trading_plan_id_foreign`(`plan_id`),
    INDEX `ai_trading_duration_id_foreign`(`duration_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trading_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `duration` INTEGER NOT NULL,
    `timeframe` ENUM('HOUR', 'DAY', 'WEEK', 'MONTH') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trading_plan_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER NOT NULL,
    `duration_id` INTEGER NOT NULL,

    INDEX `ai_trading_plan_duration_plan_id_foreign`(`plan_id`),
    INDEX `ai_trading_plan_duration_duration_id_foreign`(`duration_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `account_id` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `broker` VARCHAR(191) NULL,
    `mt` INTEGER NULL,
    `balance` DOUBLE NULL DEFAULT 0.00,
    `leverage` INTEGER NULL DEFAULT 1,
    `type` ENUM('DEMO', 'LIVE') NOT NULL DEFAULT 'DEMO',
    `status` BOOLEAN NULL,
    `created_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `min_profit` DOUBLE NOT NULL,
    `max_profit` DOUBLE NOT NULL,
    `min_amount` DOUBLE NULL DEFAULT 0.00,
    `max_amount` DOUBLE NULL,
    `invested` INTEGER NOT NULL DEFAULT 0,
    `profit_percentage` DOUBLE NOT NULL DEFAULT 0.00,
    `status` BOOLEAN NULL DEFAULT false,
    `default_profit` INTEGER NOT NULL DEFAULT 0,
    `default_result` ENUM('WIN', 'LOSS', 'DRAW') NOT NULL,
    `trending` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `forex_plan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_investment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NULL,
    `duration_id` INTEGER NULL,
    `amount` DOUBLE NULL,
    `profit` DOUBLE NULL,
    `result` ENUM('WIN', 'LOSS', 'DRAW') NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_date` DATETIME(3) NULL,

    UNIQUE INDEX `forex_investment_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_plan_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER NOT NULL,
    `duration_id` INTEGER NOT NULL,

    INDEX `idx_plan_id`(`plan_id`),
    INDEX `idx_duration_id`(`duration_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `duration` INTEGER NOT NULL,
    `timeframe` ENUM('HOUR', 'DAY', 'WEEK', 'MONTH') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_signal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_account_signal` (
    `forex_account_id` INTEGER NOT NULL,
    `forex_signal_id` INTEGER NOT NULL,

    PRIMARY KEY (`forex_account_id`, `forex_signal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forex_currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `forex_currency_currency_key`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `whitepaper` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ico_project_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `purchase_currency` VARCHAR(191) NOT NULL DEFAULT 'ETH',
    `purchase_wallet_type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL DEFAULT 'SPOT',
    `address` VARCHAR(191) NOT NULL,
    `total_supply` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `project_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_phase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `token_id` INTEGER NOT NULL,
    `min_purchase` DOUBLE NOT NULL DEFAULT 0,
    `max_purchase` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_contribution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `phase_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ico_contribution_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `token_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ico_allocation_token_id_key`(`token_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ico_phase_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `allocation_id` INTEGER NOT NULL,
    `phase_id` INTEGER NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staking_pool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(191) NOT NULL,
    `type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL DEFAULT 'SPOT',
    `min_stake` DOUBLE NOT NULL,
    `max_stake` DOUBLE NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `staking_pool_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staking_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pool_id` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `interest_rate` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staking_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `pool_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `stake_date` DATETIME(3) NOT NULL,
    `release_date` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'RELEASED', 'WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `staking_log_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `faq_category_identifier_key`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faq_category_id` INTEGER NOT NULL,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `category_id` INTEGER NOT NULL,
    `inventory_quantity` INTEGER NOT NULL,
    `file_path` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `image` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `wallet_type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL DEFAULT 'SPOT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ecommerce_order_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_order_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `key` VARCHAR(191) NULL,

    UNIQUE INDEX `ecommerce_order_item_order_id_product_id_key`(`order_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `ecommerce_review_product_id_user_id_unique`(`product_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_discount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `percentage` INTEGER NOT NULL,
    `valid_until` DATETIME(3) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `ecommerce_discount_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_user_discount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `discount_id` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `ecommerce_user_discount_user_id_discount_id_unique`(`user_id`, `discount_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecommerce_wishlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ecommerce_wishlist_user_id_product_id_key`(`user_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_offer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `wallet_type` ENUM('FIAT', 'SPOT', 'ECO') NOT NULL DEFAULT 'SPOT',
    `currency` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `min_amount` DOUBLE NOT NULL DEFAULT 0.00,
    `max_amount` DOUBLE NULL,
    `in_order` DOUBLE NOT NULL DEFAULT 0.00,
    `price` DOUBLE NOT NULL,
    `payment_method_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `p2p_offer_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `seller_id` INTEGER NOT NULL,
    `offer_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'DISPUTE_OPEN', 'ESCROW_REVIEW', 'CANCELLED', 'RELEASED', 'COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `messages` JSON NULL,
    `tx_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `p2p_trade_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_escrow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trade_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'HELD', 'RELEASED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `p2p_escrow_trade_id_key`(`trade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_payment_method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `instructions` TEXT NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `image` VARCHAR(1000) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_dispute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trade_id` INTEGER NOT NULL,
    `raised_by_id` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `resolution` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reviewer_id` INTEGER NOT NULL,
    `reviewed_id` INTEGER NOT NULL,
    `offer_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `p2p_review_reviewer_id_reviewed_id_offer_id_key`(`reviewer_id`, `reviewed_id`, `offer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `p2p_commission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trade_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `p2p_commission_trade_id_key`(`trade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_referral` ADD CONSTRAINT `mlm_referral_referrerUuid_fkey` FOREIGN KEY (`referrerUuid`) REFERENCES `user`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_referral` ADD CONSTRAINT `mlm_referral_referredUuid_fkey` FOREIGN KEY (`referredUuid`) REFERENCES `user`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_binary_node` ADD CONSTRAINT `mlm_binary_node_referral_id_fkey` FOREIGN KEY (`referral_id`) REFERENCES `mlm_referral`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_binary_node` ADD CONSTRAINT `mlm_binary_node_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `mlm_binary_node`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_binary_node` ADD CONSTRAINT `mlm_binary_node_left_child_id_fkey` FOREIGN KEY (`left_child_id`) REFERENCES `mlm_binary_node`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_binary_node` ADD CONSTRAINT `mlm_binary_node_right_child_id_fkey` FOREIGN KEY (`right_child_id`) REFERENCES `mlm_binary_node`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_unilevel_node` ADD CONSTRAINT `mlm_unilevel_node_referral_id_fkey` FOREIGN KEY (`referral_id`) REFERENCES `mlm_referral`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_unilevel_node` ADD CONSTRAINT `mlm_unilevel_node_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `mlm_unilevel_node`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_referral_reward` ADD CONSTRAINT `mlm_referral_reward_condition_id_fkey` FOREIGN KEY (`condition_id`) REFERENCES `mlm_referral_condition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mlm_referral_reward` ADD CONSTRAINT `mlm_referral_reward_referrerUuid_fkey` FOREIGN KEY (`referrerUuid`) REFERENCES `user`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provideruser` ADD CONSTRAINT `ProviderUser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refreshtokens` ADD CONSTRAINT `RefreshTokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `RolePermission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `RolePermission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_key` ADD CONSTRAINT `api_key_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_data` ADD CONSTRAINT `wallet_data_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecosystem_utxo` ADD CONSTRAINT `ecosystem_utxo_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecosystem_custodial_wallet` ADD CONSTRAINT `ecosystem_custodial_wallet_master_wallet_id_fkey` FOREIGN KEY (`master_wallet_id`) REFERENCES `ecosystem_master_wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecosystem_private_ledger` ADD CONSTRAINT `ecosystem_private_ledger_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `twofactor` ADD CONSTRAINT `twofactor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `author` ADD CONSTRAINT `author_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comments_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comments_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tag` ADD CONSTRAINT `post_tag_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tag` ADD CONSTRAINT `post_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `posts_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `posts_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exchange_orders` ADD CONSTRAINT `exchange_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exchange_watchlist` ADD CONSTRAINT `exchange_watchlist_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binary_orders` ADD CONSTRAINT `binary_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investment` ADD CONSTRAINT `investment_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investment` ADD CONSTRAINT `investment_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `investment_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investment` ADD CONSTRAINT `investment_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_chat` ADD CONSTRAINT `support_chat_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_chat` ADD CONSTRAINT `support_chat_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket` ADD CONSTRAINT `support_ticket_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket` ADD CONSTRAINT `support_ticket_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `support_chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc` ADD CONSTRAINT `kyc_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc` ADD CONSTRAINT `kyc_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `kyc_template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trading` ADD CONSTRAINT `ai_trading_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trading` ADD CONSTRAINT `ai_trading_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `ai_trading_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trading` ADD CONSTRAINT `ai_trading_duration_id_foreign` FOREIGN KEY (`duration_id`) REFERENCES `ai_trading_duration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trading_plan_duration` ADD CONSTRAINT `ai_trading_plan_duration_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `ai_trading_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trading_plan_duration` ADD CONSTRAINT `ai_trading_plan_duration_duration_id_foreign` FOREIGN KEY (`duration_id`) REFERENCES `ai_trading_duration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_account` ADD CONSTRAINT `forex_account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_investment` ADD CONSTRAINT `forex_investment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_investment` ADD CONSTRAINT `forex_investment_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `forex_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_investment` ADD CONSTRAINT `forex_investment_duration_id_fkey` FOREIGN KEY (`duration_id`) REFERENCES `forex_duration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_plan_duration` ADD CONSTRAINT `forex_plan_duration_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `forex_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_plan_duration` ADD CONSTRAINT `forex_plan_duration_duration_id_fkey` FOREIGN KEY (`duration_id`) REFERENCES `forex_duration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_account_signal` ADD CONSTRAINT `forex_account_signal_forex_account_id_fkey` FOREIGN KEY (`forex_account_id`) REFERENCES `forex_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forex_account_signal` ADD CONSTRAINT `forex_account_signal_forex_signal_id_fkey` FOREIGN KEY (`forex_signal_id`) REFERENCES `forex_signal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_token` ADD CONSTRAINT `ico_token_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `ico_project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_phase` ADD CONSTRAINT `ico_phase_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `ico_token`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_contribution` ADD CONSTRAINT `ico_contribution_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_contribution` ADD CONSTRAINT `ico_contribution_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `ico_phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_allocation` ADD CONSTRAINT `ico_allocation_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `ico_token`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_phase_allocation` ADD CONSTRAINT `ico_phase_allocation_allocation_id_fkey` FOREIGN KEY (`allocation_id`) REFERENCES `ico_allocation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ico_phase_allocation` ADD CONSTRAINT `ico_phase_allocation_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `ico_phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staking_duration` ADD CONSTRAINT `staking_duration_pool_id_fkey` FOREIGN KEY (`pool_id`) REFERENCES `staking_pool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staking_log` ADD CONSTRAINT `staking_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staking_log` ADD CONSTRAINT `staking_log_pool_id_fkey` FOREIGN KEY (`pool_id`) REFERENCES `staking_pool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faq` ADD CONSTRAINT `faq_faq_category_id_fkey` FOREIGN KEY (`faq_category_id`) REFERENCES `faq_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_product` ADD CONSTRAINT `ecommerce_product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ecommerce_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_order` ADD CONSTRAINT `ecommerce_order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_order_item` ADD CONSTRAINT `ecommerce_order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_order_item` ADD CONSTRAINT `ecommerce_order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `ecommerce_product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_review` ADD CONSTRAINT `ecommerce_review_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `ecommerce_product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_review` ADD CONSTRAINT `ecommerce_review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_discount` ADD CONSTRAINT `ecommerce_discount_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `ecommerce_product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_user_discount` ADD CONSTRAINT `ecommerce_user_discount_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_user_discount` ADD CONSTRAINT `ecommerce_user_discount_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `ecommerce_discount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_wishlist` ADD CONSTRAINT `ecommerce_wishlist_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_wishlist` ADD CONSTRAINT `ecommerce_wishlist_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `ecommerce_product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_offer` ADD CONSTRAINT `p2p_offer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_offer` ADD CONSTRAINT `p2p_offer_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `p2p_payment_method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_trade` ADD CONSTRAINT `p2p_trade_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_trade` ADD CONSTRAINT `p2p_trade_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_trade` ADD CONSTRAINT `p2p_trade_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `p2p_offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_escrow` ADD CONSTRAINT `p2p_escrow_trade_id_fkey` FOREIGN KEY (`trade_id`) REFERENCES `p2p_trade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_payment_method` ADD CONSTRAINT `p2p_payment_method_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_dispute` ADD CONSTRAINT `p2p_dispute_trade_id_fkey` FOREIGN KEY (`trade_id`) REFERENCES `p2p_trade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_dispute` ADD CONSTRAINT `p2p_dispute_raised_by_id_fkey` FOREIGN KEY (`raised_by_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_review` ADD CONSTRAINT `p2p_review_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_review` ADD CONSTRAINT `p2p_review_reviewed_id_fkey` FOREIGN KEY (`reviewed_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_review` ADD CONSTRAINT `p2p_review_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `p2p_offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `p2p_commission` ADD CONSTRAINT `p2p_commission_trade_id_fkey` FOREIGN KEY (`trade_id`) REFERENCES `p2p_trade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
