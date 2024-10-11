-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2024 at 06:24 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `newdashboard2`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_investment`
--

CREATE TABLE `ai_investment` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `amount` double NOT NULL,
  `profit` double DEFAULT NULL,
  `result` enum('WIN','LOSS','DRAW') DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `symbol` varchar(191) NOT NULL,
  `type` enum('SPOT','ECO') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_investment_duration`
--

CREATE TABLE `ai_investment_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `duration` int(11) NOT NULL,
  `timeframe` enum('HOUR','DAY','WEEK','MONTH') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_investment_plan`
--

CREATE TABLE `ai_investment_plan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `invested` int(11) NOT NULL DEFAULT 0,
  `profitPercentage` double NOT NULL DEFAULT 0,
  `minProfit` double NOT NULL,
  `maxProfit` double NOT NULL,
  `minAmount` double NOT NULL DEFAULT 0,
  `maxAmount` double NOT NULL,
  `trending` tinyint(1) DEFAULT 0,
  `defaultProfit` double NOT NULL,
  `defaultResult` enum('WIN','LOSS','DRAW') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_investment_plan_duration`
--

CREATE TABLE `ai_investment_plan_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('GENERAL','EVENT','UPDATE') NOT NULL DEFAULT 'GENERAL',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_key`
--

CREATE TABLE `api_key` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `key` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `author`
--

CREATE TABLE `author` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `binary_order`
--

CREATE TABLE `binary_order` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `symbol` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `amount` double NOT NULL,
  `profit` double NOT NULL,
  `side` enum('RISE','FALL') NOT NULL,
  `type` enum('RISE_FALL') NOT NULL,
  `status` enum('PENDING','WIN','LOSS','DRAW') NOT NULL,
  `isDemo` tinyint(1) NOT NULL DEFAULT 0,
  `closedAt` datetime(3) NOT NULL,
  `closePrice` double DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` text NOT NULL,
  `postId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currency`
--

CREATE TABLE `currency` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `symbol` varchar(191) NOT NULL,
  `precision` double NOT NULL,
  `price` double DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deposit_gateway`
--

CREATE TABLE `deposit_gateway` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `alias` varchar(191) DEFAULT NULL,
  `currencies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`currencies`)),
  `fixedFee` double DEFAULT 0,
  `percentageFee` double DEFAULT 0,
  `minAmount` double DEFAULT 0,
  `maxAmount` double DEFAULT NULL,
  `type` enum('FIAT','CRYPTO') NOT NULL DEFAULT 'FIAT',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `version` varchar(191) DEFAULT '0.0.1',
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deposit_method`
--

CREATE TABLE `deposit_method` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `fixedFee` double NOT NULL DEFAULT 0,
  `percentageFee` double NOT NULL DEFAULT 0,
  `minAmount` double NOT NULL DEFAULT 0,
  `maxAmount` double NOT NULL,
  `customFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customFields`)),
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_category`
--

CREATE TABLE `ecommerce_category` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_discount`
--

CREATE TABLE `ecommerce_discount` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(191) NOT NULL,
  `percentage` int(11) NOT NULL,
  `validUntil` datetime(3) NOT NULL,
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_order`
--

CREATE TABLE `ecommerce_order` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `shippingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_order_item`
--

CREATE TABLE `ecommerce_order_item` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `orderId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `quantity` int(11) NOT NULL,
  `key` varchar(191) DEFAULT NULL,
  `filePath` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_product`
--

CREATE TABLE `ecommerce_product` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `type` enum('DOWNLOADABLE','PHYSICAL') NOT NULL,
  `price` double NOT NULL,
  `categoryId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `inventoryQuantity` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `image` varchar(191) DEFAULT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'USD',
  `walletType` enum('FIAT','SPOT','ECO') NOT NULL DEFAULT 'SPOT',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_review`
--

CREATE TABLE `ecommerce_review` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_shipping`
--

CREATE TABLE `ecommerce_shipping` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `loadId` varchar(255) NOT NULL,
  `loadStatus` enum('PENDING','TRANSIT','DELIVERED','CANCELLED') NOT NULL,
  `shipper` varchar(255) NOT NULL,
  `transporter` varchar(255) NOT NULL,
  `goodsType` varchar(255) NOT NULL,
  `weight` float NOT NULL,
  `volume` float NOT NULL,
  `description` varchar(255) NOT NULL,
  `vehicle` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `cost` float DEFAULT NULL,
  `tax` float DEFAULT NULL,
  `deliveryDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_user_discount`
--

CREATE TABLE `ecommerce_user_discount` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `discountId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_wishlist`
--

CREATE TABLE `ecommerce_wishlist` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_wishlist_item`
--

CREATE TABLE `ecommerce_wishlist_item` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `wishlistId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `productId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_custodial_wallet`
--

CREATE TABLE `ecosystem_custodial_wallet` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `masterWalletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `address` varchar(255) NOT NULL,
  `chain` varchar(255) NOT NULL,
  `network` varchar(255) NOT NULL DEFAULT 'mainnet',
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_market`
--

CREATE TABLE `ecosystem_market` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pair` varchar(191) NOT NULL,
  `isTrending` tinyint(1) DEFAULT 0,
  `isHot` tinyint(1) DEFAULT 0,
  `metadata` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `currency` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_master_wallet`
--

CREATE TABLE `ecosystem_master_wallet` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `chain` varchar(255) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `data` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `lastIndex` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_private_ledger`
--

CREATE TABLE `ecosystem_private_ledger` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `walletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `index` int(11) NOT NULL,
  `currency` varchar(50) NOT NULL,
  `chain` varchar(50) NOT NULL,
  `network` varchar(50) NOT NULL DEFAULT 'mainnet',
  `offchainDifference` double NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_token`
--

CREATE TABLE `ecosystem_token` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `chain` varchar(255) NOT NULL,
  `network` varchar(255) NOT NULL,
  `contract` varchar(255) NOT NULL,
  `contractType` enum('PERMIT','NO_PERMIT','NATIVE') NOT NULL DEFAULT 'PERMIT',
  `type` varchar(255) NOT NULL,
  `decimals` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `precision` int(11) DEFAULT 8,
  `limits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`limits`)),
  `icon` varchar(1000) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `fee` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fee`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ecosystem_utxo`
--

CREATE TABLE `ecosystem_utxo` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `walletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `transactionId` varchar(255) NOT NULL,
  `index` int(11) NOT NULL,
  `amount` double NOT NULL,
  `script` varchar(1000) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange`
--

CREATE TABLE `exchange` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `status` tinyint(1) DEFAULT 0,
  `username` varchar(191) DEFAULT NULL,
  `licenseStatus` tinyint(1) DEFAULT 0,
  `version` varchar(191) DEFAULT '0.0.1',
  `productId` varchar(191) DEFAULT NULL,
  `type` varchar(191) DEFAULT 'spot'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_currency`
--

CREATE TABLE `exchange_currency` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `precision` double NOT NULL,
  `price` double DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `fee` double DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_market`
--

CREATE TABLE `exchange_market` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pair` varchar(191) NOT NULL,
  `isTrending` tinyint(1) DEFAULT 0,
  `isHot` tinyint(1) DEFAULT 0,
  `metadata` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `currency` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_order`
--

CREATE TABLE `exchange_order` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `status` enum('OPEN','CLOSED','CANCELED','EXPIRED','REJECTED') NOT NULL,
  `symbol` varchar(191) NOT NULL,
  `type` enum('MARKET','LIMIT') NOT NULL,
  `timeInForce` enum('GTC','IOC','FOK','PO') NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `price` double NOT NULL,
  `average` double DEFAULT NULL,
  `amount` double NOT NULL,
  `filled` double NOT NULL,
  `remaining` double NOT NULL,
  `cost` double NOT NULL,
  `trades` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`trades`)),
  `fee` double NOT NULL,
  `feeCurrency` varchar(191) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_watchlist`
--

CREATE TABLE `exchange_watchlist` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `symbol` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `extension`
--

CREATE TABLE `extension` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `productId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `version` varchar(191) DEFAULT '0.0.1',
  `image` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `faqCategoryId` varchar(191) NOT NULL,
  `question` longtext NOT NULL,
  `answer` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faq_category`
--

CREATE TABLE `faq_category` (
  `id` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_account`
--

CREATE TABLE `forex_account` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `broker` varchar(191) DEFAULT NULL,
  `mt` int(11) DEFAULT NULL,
  `balance` double DEFAULT 0,
  `leverage` int(11) DEFAULT 1,
  `type` enum('DEMO','LIVE') NOT NULL DEFAULT 'DEMO',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_account_signal`
--

CREATE TABLE `forex_account_signal` (
  `forexAccountId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `forexSignalId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_currency`
--

CREATE TABLE `forex_currency` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency` varchar(191) NOT NULL,
  `type` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_duration`
--

CREATE TABLE `forex_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `duration` int(11) NOT NULL,
  `timeframe` enum('HOUR','DAY','WEEK','MONTH') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_investment`
--

CREATE TABLE `forex_investment` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `profit` double DEFAULT NULL,
  `result` enum('WIN','LOSS','DRAW') DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'ACTIVE',
  `endDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_plan`
--

CREATE TABLE `forex_plan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `minProfit` double NOT NULL,
  `maxProfit` double NOT NULL,
  `minAmount` double DEFAULT 0,
  `maxAmount` double DEFAULT NULL,
  `invested` int(11) NOT NULL DEFAULT 0,
  `profitPercentage` double NOT NULL DEFAULT 0,
  `status` tinyint(1) DEFAULT 0,
  `defaultProfit` int(11) NOT NULL DEFAULT 0,
  `defaultResult` enum('WIN','LOSS','DRAW') NOT NULL,
  `trending` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `currency` varchar(191) NOT NULL,
  `walletType` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_plan_duration`
--

CREATE TABLE `forex_plan_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forex_signal`
--

CREATE TABLE `forex_signal` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(191) NOT NULL,
  `image` varchar(191) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `frontend`
--

CREATE TABLE `frontend` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `section` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_allocation`
--

CREATE TABLE `ico_allocation` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `percentage` double NOT NULL,
  `tokenId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_contribution`
--

CREATE TABLE `ico_contribution` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `phaseId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_phase`
--

CREATE TABLE `ico_phase` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `price` double NOT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `tokenId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `minPurchase` double NOT NULL DEFAULT 0,
  `maxPurchase` double NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_phase_allocation`
--

CREATE TABLE `ico_phase_allocation` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `allocationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `phaseId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `percentage` double NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_project`
--

CREATE TABLE `ico_project` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` longtext NOT NULL,
  `website` varchar(191) NOT NULL,
  `whitepaper` longtext NOT NULL,
  `image` varchar(191) NOT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ico_token`
--

CREATE TABLE `ico_token` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `projectId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `chain` varchar(191) NOT NULL,
  `currency` varchar(191) NOT NULL,
  `purchaseCurrency` varchar(191) NOT NULL DEFAULT 'ETH',
  `purchaseWalletType` enum('FIAT','SPOT','ECO') NOT NULL DEFAULT 'SPOT',
  `address` varchar(191) NOT NULL,
  `totalSupply` int(11) NOT NULL,
  `description` longtext NOT NULL,
  `image` varchar(191) NOT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investment`
--

CREATE TABLE `investment` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `amount` double NOT NULL,
  `profit` double DEFAULT NULL,
  `result` enum('WIN','LOSS','DRAW') DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'ACTIVE',
  `endDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `walletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investment_duration`
--

CREATE TABLE `investment_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `duration` int(11) NOT NULL,
  `timeframe` enum('HOUR','DAY','WEEK','MONTH') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investment_plan`
--

CREATE TABLE `investment_plan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `description` text NOT NULL,
  `currency` varchar(191) NOT NULL,
  `minAmount` double NOT NULL,
  `maxAmount` double NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `invested` int(11) NOT NULL DEFAULT 0,
  `profitPercentage` double NOT NULL DEFAULT 0,
  `minProfit` double NOT NULL,
  `maxProfit` double NOT NULL,
  `defaultProfit` int(11) NOT NULL DEFAULT 0,
  `defaultResult` enum('WIN','LOSS','DRAW') NOT NULL,
  `trending` tinyint(1) DEFAULT 0,
  `walletType` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investment_plan_duration`
--

CREATE TABLE `investment_plan_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('UNPAID','PAID','CANCELLED') NOT NULL,
  `transactionId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `senderId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `receiverId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kyc`
--

CREATE TABLE `kyc` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `templateId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `level` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kyc_template`
--

CREATE TABLE `kyc_template` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(191) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `status` tinyint(1) DEFAULT 0,
  `customOptions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customOptions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mailwizard_block`
--

CREATE TABLE `mailwizard_block` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `design` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mailwizard_campaign`
--

CREATE TABLE `mailwizard_campaign` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `templateId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `status` enum('PENDING','PAUSED','ACTIVE','STOPPED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `speed` int(11) NOT NULL DEFAULT 1,
  `targets` longtext DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mailwizard_template`
--

CREATE TABLE `mailwizard_template` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `content` longtext NOT NULL,
  `design` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mlm_binary_node`
--

CREATE TABLE `mlm_binary_node` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referralId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `parentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `leftChildId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `rightChildId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mlm_referral`
--

CREATE TABLE `mlm_referral` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referrerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referredId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','ACTIVE','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mlm_referral_condition`
--

CREATE TABLE `mlm_referral_condition` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `type` enum('DEPOSIT','TRADE','INVESTENT','INVESTMENT','AI_INVESTMENT','FOREX_INVESTMENT','ICO_CONTRIBUTION','STAKING','ECOMMERCE_PURCHASE','P2P_TRADE') NOT NULL,
  `reward` double NOT NULL,
  `rewardType` enum('PERCENTAGE','FIXED') NOT NULL,
  `rewardWalletType` enum('FIAT','SPOT','ECO') NOT NULL,
  `rewardCurrency` varchar(191) NOT NULL,
  `rewardChain` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mlm_referral_reward`
--

CREATE TABLE `mlm_referral_reward` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `conditionId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referrerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reward` double NOT NULL,
  `isClaimed` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mlm_unilevel_node`
--

CREATE TABLE `mlm_unilevel_node` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `referralId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `parentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('SECURITY','SYSTEM','ACTIVITY') NOT NULL DEFAULT 'SYSTEM',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_template`
--

CREATE TABLE `notification_template` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `emailBody` text DEFAULT NULL,
  `smsBody` text DEFAULT NULL,
  `pushBody` text DEFAULT NULL,
  `shortCodes` text DEFAULT NULL,
  `email` tinyint(1) DEFAULT 0,
  `sms` tinyint(1) DEFAULT 0,
  `push` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `one_time_token`
--

CREATE TABLE `one_time_token` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tokenId` varchar(60) NOT NULL,
  `tokenType` enum('RESET') DEFAULT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_commission`
--

CREATE TABLE `p2p_commission` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tradeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_dispute`
--

CREATE TABLE `p2p_dispute` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tradeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `raisedById` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','OPEN','RESOLVED','CANCELLED') NOT NULL,
  `resolution` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_escrow`
--

CREATE TABLE `p2p_escrow` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tradeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `status` enum('PENDING','HELD','RELEASED','CANCELLED') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_offer`
--

CREATE TABLE `p2p_offer` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `paymentMethodId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `walletType` enum('FIAT','SPOT','ECO') NOT NULL,
  `currency` varchar(191) NOT NULL,
  `chain` varchar(191) DEFAULT NULL,
  `amount` double NOT NULL,
  `minAmount` double NOT NULL,
  `maxAmount` double DEFAULT NULL,
  `inOrder` double NOT NULL,
  `price` double NOT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED','CANCELLED') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_payment_method`
--

CREATE TABLE `p2p_payment_method` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'USD',
  `image` varchar(1000) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `walletType` enum('FIAT','SPOT','ECO') NOT NULL DEFAULT 'FIAT',
  `chain` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_review`
--

CREATE TABLE `p2p_review` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reviewerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reviewedId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `offerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2p_trade`
--

CREATE TABLE `p2p_trade` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sellerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `offerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `status` enum('PENDING','PAID','DISPUTE_OPEN','ESCROW_REVIEW','CANCELLED','COMPLETED','REFUNDED') NOT NULL,
  `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`messages`)),
  `txHash` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page`
--

CREATE TABLE `page` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `status` enum('PUBLISHED','DRAFT') NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `components` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `categoryId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `authorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('PUBLISHED','DRAFT') NOT NULL DEFAULT 'DRAFT',
  `image` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_tag`
--

CREATE TABLE `post_tag` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `postId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tagId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `provider_user`
--

CREATE TABLE `provider_user` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `providerUserId` varchar(255) NOT NULL,
  `provider` enum('GOOGLE','WALLET') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  `permissionId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staking_duration`
--

CREATE TABLE `staking_duration` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `poolId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `duration` int(11) NOT NULL,
  `interestRate` double NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staking_log`
--

CREATE TABLE `staking_log` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `poolId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` double NOT NULL,
  `status` enum('ACTIVE','RELEASED','COLLECTED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `durationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staking_pool`
--

CREATE TABLE `staking_pool` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `currency` varchar(191) NOT NULL,
  `chain` varchar(191) NOT NULL,
  `type` enum('FIAT','SPOT','ECO') NOT NULL DEFAULT 'SPOT',
  `minStake` double NOT NULL,
  `maxStake` double NOT NULL,
  `status` enum('ACTIVE','INACTIVE','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  `icon` varchar(1000) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket`
--

CREATE TABLE `support_ticket` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subject` varchar(191) NOT NULL,
  `importance` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  `status` enum('PENDING','OPEN','REPLIED','CLOSED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `agentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`messages`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `walletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('FAILED','DEPOSIT','WITHDRAW','OUTGOING_TRANSFER','INCOMING_TRANSFER','PAYMENT','REFUND','BINARY_ORDER','EXCHANGE_ORDER','INVESTMENT','INVESTMENT_ROI','AI_INVESTMENT','AI_INVESTMENT_ROI','INVOICE','FOREX_DEPOSIT','FOREX_WITHDRAW','FOREX_INVESTMENT','FOREX_INVESTMENT_ROI','ICO_CONTRIBUTION','REFERRAL_REWARD','STAKING','STAKING_REWARD','P2P_OFFER_TRANSFER','P2P_TRADE') NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','CANCELLED','EXPIRED','REJECTED','REFUNDED','TIMEOUT') NOT NULL DEFAULT 'PENDING',
  `amount` double NOT NULL,
  `fee` double DEFAULT 0,
  `description` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_factor`
--

CREATE TABLE `two_factor` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `secret` varchar(255) NOT NULL,
  `type` enum('EMAIL','SMS','APP') NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar` varchar(1000) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `phone` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `profile` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`profile`)),
  `lastLogin` datetime DEFAULT NULL,
  `lastFailedLogin` datetime DEFAULT NULL,
  `failedLoginAttempts` int(11) DEFAULT 0,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED','BANNED') DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('FIAT','SPOT','ECO') NOT NULL,
  `currency` varchar(255) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `inOrder` double DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`address`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_data`
--

CREATE TABLE `wallet_data` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `walletId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency` varchar(255) NOT NULL,
  `chain` varchar(255) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `index` int(11) NOT NULL,
  `data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_pnl`
--

CREATE TABLE `wallet_pnl` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `balances` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`balances`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_method`
--

CREATE TABLE `withdraw_method` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `processingTime` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `fixedFee` double NOT NULL DEFAULT 0,
  `percentageFee` double NOT NULL DEFAULT 0,
  `minAmount` double NOT NULL DEFAULT 0,
  `maxAmount` double NOT NULL,
  `customFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customFields`)),
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_investment`
--
ALTER TABLE `ai_investment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aiInvestmentIdKey` (`id`) USING BTREE,
  ADD KEY `aiInvestmentUserIdForeign` (`userId`) USING BTREE,
  ADD KEY `aiInvestmentPlanIdForeign` (`planId`) USING BTREE,
  ADD KEY `aiInvestmentDurationIdForeign` (`durationId`) USING BTREE;

--
-- Indexes for table `ai_investment_duration`
--
ALTER TABLE `ai_investment_duration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_investment_plan`
--
ALTER TABLE `ai_investment_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aiInvestmentPlanNameKey` (`name`);

--
-- Indexes for table `ai_investment_plan_duration`
--
ALTER TABLE `ai_investment_plan_duration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ai_investment_plan_duration_durationId_planId_unique` (`planId`,`durationId`),
  ADD KEY `aiInvestmentPlanDurationPlanIdForeign` (`planId`) USING BTREE,
  ADD KEY `aiInvestmentPlanDurationDurationIdForeign` (`durationId`) USING BTREE;

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_key`
--
ALTER TABLE `api_key`
  ADD PRIMARY KEY (`id`),
  ADD KEY `apiKeyUserIdIdx` (`userId`) USING BTREE;

--
-- Indexes for table `author`
--
ALTER TABLE `author`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `authorUserIdFkey` (`userId`),
  ADD UNIQUE KEY `authorIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `authorUserIdKey` (`userId`) USING BTREE;

--
-- Indexes for table `binary_order`
--
ALTER TABLE `binary_order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `binaryOrderIdKey` (`id`) USING BTREE,
  ADD KEY `binaryOrderUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categorySlugKey` (`slug`);

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commentsPostIdForeign` (`postId`) USING BTREE,
  ADD KEY `commentsAuthorIdForeign` (`userId`) USING BTREE,
  ADD KEY `commentsUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `currency`
--
ALTER TABLE `currency`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposit_gateway`
--
ALTER TABLE `deposit_gateway`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `depositGatewayNameKey` (`name`),
  ADD UNIQUE KEY `depositGatewayAliasKey` (`alias`),
  ADD UNIQUE KEY `depositGatewayProductIdKey` (`productId`);

--
-- Indexes for table `deposit_method`
--
ALTER TABLE `deposit_method`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ecommerce_category`
--
ALTER TABLE `ecommerce_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ecommerce_discount`
--
ALTER TABLE `ecommerce_discount`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerceDiscountCodeKey` (`code`),
  ADD KEY `ecommerceDiscountProductIdFkey` (`productId`) USING BTREE;

--
-- Indexes for table `ecommerce_order`
--
ALTER TABLE `ecommerce_order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerceOrderIdKey` (`id`) USING BTREE,
  ADD KEY `ecommerceOrderUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `ecommerceOrderShippingIdFkey` (`shippingId`) USING BTREE,
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `ecommerce_order_item`
--
ALTER TABLE `ecommerce_order_item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerce_order_item_productId_orderId_unique` (`orderId`,`productId`),
  ADD UNIQUE KEY `ecommerceOrderItemOrderIdProductIdKey` (`orderId`,`productId`) USING BTREE,
  ADD KEY `ecommerceOrderItemProductIdFkey` (`productId`) USING BTREE;

--
-- Indexes for table `ecommerce_product`
--
ALTER TABLE `ecommerce_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ecommerceProductCategoryIdFkey` (`categoryId`) USING BTREE;

--
-- Indexes for table `ecommerce_review`
--
ALTER TABLE `ecommerce_review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerceReviewProductIdUserIdUnique` (`productId`,`userId`) USING BTREE,
  ADD KEY `ecommerceReviewUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `ecommerce_shipping`
--
ALTER TABLE `ecommerce_shipping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ecommerce_user_discount`
--
ALTER TABLE `ecommerce_user_discount`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerceUserDiscountUserIdDiscountIdUnique` (`userId`,`discountId`) USING BTREE,
  ADD KEY `ecommerceUserDiscountDiscountIdFkey` (`discountId`) USING BTREE;

--
-- Indexes for table `ecommerce_wishlist`
--
ALTER TABLE `ecommerce_wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ecommerceWishlistUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `ecommerce_wishlist_item`
--
ALTER TABLE `ecommerce_wishlist_item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecommerce_wishlist_item_productId_wishlistId_unique` (`wishlistId`,`productId`),
  ADD UNIQUE KEY `ecommerceWishlistItemWishlistIdProductId` (`wishlistId`,`productId`) USING BTREE,
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `ecosystem_custodial_wallet`
--
ALTER TABLE `ecosystem_custodial_wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecosystemCustodialWalletAddressKey` (`address`),
  ADD UNIQUE KEY `ecosystemCustodialWalletIdKey` (`id`) USING BTREE,
  ADD KEY `custodialWalletMasterWalletIdIdx` (`masterWalletId`) USING BTREE;

--
-- Indexes for table `ecosystem_market`
--
ALTER TABLE `ecosystem_market`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecosystemMarketCurrencyPairKey` (`currency`,`pair`) USING BTREE;

--
-- Indexes for table `ecosystem_master_wallet`
--
ALTER TABLE `ecosystem_master_wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecosystemMasterWalletIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `ecosystemMasterWalletChainCurrencyKey` (`chain`,`currency`) USING BTREE;

--
-- Indexes for table `ecosystem_private_ledger`
--
ALTER TABLE `ecosystem_private_ledger`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniqueEcosystemPrivateLedger` (`walletId`,`index`,`currency`,`chain`,`network`) USING BTREE;

--
-- Indexes for table `ecosystem_token`
--
ALTER TABLE `ecosystem_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ecosystemTokenContractChainKey` (`contract`,`chain`) USING BTREE;

--
-- Indexes for table `ecosystem_utxo`
--
ALTER TABLE `ecosystem_utxo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ecosystemUtxoWalletIdIdx` (`walletId`) USING BTREE;

--
-- Indexes for table `exchange`
--
ALTER TABLE `exchange`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exchangeProductIdKey` (`productId`);

--
-- Indexes for table `exchange_currency`
--
ALTER TABLE `exchange_currency`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exchangeCurrencyCurrencyKey` (`currency`);

--
-- Indexes for table `exchange_market`
--
ALTER TABLE `exchange_market`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exchangeMarketCurrencyPairKey` (`currency`,`pair`) USING BTREE;

--
-- Indexes for table `exchange_order`
--
ALTER TABLE `exchange_order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exchangeOrderIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `exchangeOrderReferenceIdKey` (`referenceId`),
  ADD KEY `exchangeOrderUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `exchange_watchlist`
--
ALTER TABLE `exchange_watchlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exchangeWatchlistUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `extension`
--
ALTER TABLE `extension`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `extensionProductIdKey` (`productId`),
  ADD UNIQUE KEY `extensionNameKey` (`name`);

--
-- Indexes for table `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faqCategoryId` (`faqCategoryId`);

--
-- Indexes for table `faq_category`
--
ALTER TABLE `faq_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forex_account`
--
ALTER TABLE `forex_account`
  ADD PRIMARY KEY (`id`),
  ADD KEY `forexAccountUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `forex_account_signal`
--
ALTER TABLE `forex_account_signal`
  ADD PRIMARY KEY (`forexAccountId`,`forexSignalId`),
  ADD UNIQUE KEY `forex_account_signal_forexSignalId_forexAccountId_unique` (`forexAccountId`,`forexSignalId`),
  ADD KEY `forexAccountSignalForexSignalIdFkey` (`forexSignalId`) USING BTREE;

--
-- Indexes for table `forex_currency`
--
ALTER TABLE `forex_currency`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forex_duration`
--
ALTER TABLE `forex_duration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forex_investment`
--
ALTER TABLE `forex_investment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `forexInvestmentIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `forexInvestmentStatusIndex` (`userId`,`planId`,`status`) USING BTREE,
  ADD KEY `forexInvestmentUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `forexInvestmentPlanIdFkey` (`planId`) USING BTREE,
  ADD KEY `forexInvestmentDurationIdFkey` (`durationId`) USING BTREE;

--
-- Indexes for table `forex_plan`
--
ALTER TABLE `forex_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `forexPlanNameKey` (`name`);

--
-- Indexes for table `forex_plan_duration`
--
ALTER TABLE `forex_plan_duration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `forex_plan_duration_durationId_planId_unique` (`planId`,`durationId`),
  ADD KEY `idxPlanId` (`planId`) USING BTREE,
  ADD KEY `idxDurationId` (`durationId`) USING BTREE;

--
-- Indexes for table `forex_signal`
--
ALTER TABLE `forex_signal`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `frontend`
--
ALTER TABLE `frontend`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `frontendSectionKey` (`section`);

--
-- Indexes for table `ico_allocation`
--
ALTER TABLE `ico_allocation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `icoAllocationTokenIdFkey` (`tokenId`),
  ADD UNIQUE KEY `icoAllocationTokenIdKey` (`tokenId`) USING BTREE;

--
-- Indexes for table `ico_contribution`
--
ALTER TABLE `ico_contribution`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `icoContributionIdKey` (`id`) USING BTREE,
  ADD KEY `icoContributionUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `icoContributionPhaseIdFkey` (`phaseId`) USING BTREE;

--
-- Indexes for table `ico_phase`
--
ALTER TABLE `ico_phase`
  ADD PRIMARY KEY (`id`),
  ADD KEY `icoPhaseTokenIdFkey` (`tokenId`) USING BTREE;

--
-- Indexes for table `ico_phase_allocation`
--
ALTER TABLE `ico_phase_allocation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `icoPhaseAllocationAllocationIdFkey` (`allocationId`) USING BTREE,
  ADD KEY `icoPhaseAllocationPhaseIdFkey` (`phaseId`) USING BTREE;

--
-- Indexes for table `ico_project`
--
ALTER TABLE `ico_project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `icoProjectIdKey` (`id`) USING BTREE;

--
-- Indexes for table `ico_token`
--
ALTER TABLE `ico_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `icoTokenProjectIdFkey` (`projectId`) USING BTREE;

--
-- Indexes for table `investment`
--
ALTER TABLE `investment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `investmentIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `investmentUserIdPlanIdStatusUnique` (`userId`,`planId`,`status`) USING BTREE,
  ADD KEY `investmentUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `investmentPlanIdFkey` (`planId`) USING BTREE,
  ADD KEY `investmentDurationIdFkey` (`durationId`) USING BTREE,
  ADD KEY `walletId` (`walletId`);

--
-- Indexes for table `investment_duration`
--
ALTER TABLE `investment_duration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `investment_plan`
--
ALTER TABLE `investment_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `investmentPlanNameKey` (`name`);

--
-- Indexes for table `investment_plan_duration`
--
ALTER TABLE `investment_plan_duration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idxPlanId` (`planId`) USING BTREE,
  ADD KEY `idxDurationId` (`durationId`) USING BTREE;

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoiceSenderIdForeign` (`senderId`) USING BTREE,
  ADD KEY `invoiceReceiverIdForeign` (`receiverId`) USING BTREE,
  ADD KEY `invoiceTransactionIdForeign` (`transactionId`) USING BTREE;

--
-- Indexes for table `kyc`
--
ALTER TABLE `kyc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kycUserIdForeign` (`userId`),
  ADD UNIQUE KEY `kycUserIdKey` (`userId`) USING BTREE,
  ADD KEY `kycTemplateIdForeign` (`templateId`) USING BTREE;

--
-- Indexes for table `kyc_template`
--
ALTER TABLE `kyc_template`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kycTemplateTitleKey` (`title`);

--
-- Indexes for table `mailwizard_block`
--
ALTER TABLE `mailwizard_block`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mailwizard_campaign`
--
ALTER TABLE `mailwizard_campaign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mailwizardCampaignTemplateIdForeign` (`templateId`) USING BTREE;

--
-- Indexes for table `mailwizard_template`
--
ALTER TABLE `mailwizard_template`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mlm_binary_node`
--
ALTER TABLE `mlm_binary_node`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mlmBinaryNodeReferralIdKey` (`referralId`) USING BTREE,
  ADD KEY `mlmBinaryNodeParentIdFkey` (`parentId`) USING BTREE,
  ADD KEY `mlmBinaryNodeLeftChildIdFkey` (`leftChildId`) USING BTREE,
  ADD KEY `mlmBinaryNodeRightChildIdFkey` (`rightChildId`) USING BTREE;

--
-- Indexes for table `mlm_referral`
--
ALTER TABLE `mlm_referral`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mlmReferralReferredIdKey` (`referredId`) USING BTREE,
  ADD UNIQUE KEY `mlmReferralReferrerIdReferredIdKey` (`referrerId`,`referredId`) USING BTREE;

--
-- Indexes for table `mlm_referral_condition`
--
ALTER TABLE `mlm_referral_condition`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `mlmReferralConditionNameKey` (`name`) USING BTREE;

--
-- Indexes for table `mlm_referral_reward`
--
ALTER TABLE `mlm_referral_reward`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mlmReferralRewardConditionIdFkey` (`conditionId`) USING BTREE,
  ADD KEY `mlmReferralRewardReferrerIdFkey` (`referrerId`) USING BTREE;

--
-- Indexes for table `mlm_unilevel_node`
--
ALTER TABLE `mlm_unilevel_node`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mlmUnilevelNodeReferralIdKey` (`referralId`) USING BTREE,
  ADD KEY `mlmUnilevelNodeParentIdFkey` (`parentId`) USING BTREE;

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notificationsUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `notification_template`
--
ALTER TABLE `notification_template`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `notificationTemplateNameKey` (`name`) USING BTREE;

--
-- Indexes for table `one_time_token`
--
ALTER TABLE `one_time_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tokenId` (`tokenId`);

--
-- Indexes for table `p2p_commission`
--
ALTER TABLE `p2p_commission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `p2pCommissionTradeIdKey` (`tradeId`) USING BTREE;

--
-- Indexes for table `p2p_dispute`
--
ALTER TABLE `p2p_dispute`
  ADD PRIMARY KEY (`id`),
  ADD KEY `p2pDisputeTradeIdFkey` (`tradeId`) USING BTREE,
  ADD KEY `p2pDisputeRaisedByIdFkey` (`raisedById`) USING BTREE;

--
-- Indexes for table `p2p_escrow`
--
ALTER TABLE `p2p_escrow`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `p2pEscrowTradeIdKey` (`tradeId`) USING BTREE;

--
-- Indexes for table `p2p_offer`
--
ALTER TABLE `p2p_offer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `p2pOfferIdKey` (`id`) USING BTREE,
  ADD KEY `p2pOfferUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `p2pOfferPaymentMethodIdFkey` (`paymentMethodId`) USING BTREE;

--
-- Indexes for table `p2p_payment_method`
--
ALTER TABLE `p2p_payment_method`
  ADD PRIMARY KEY (`id`),
  ADD KEY `p2pPaymentMethodUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `p2p_review`
--
ALTER TABLE `p2p_review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `p2pReviewReviewerIdReviewedIdOfferIdKey` (`reviewerId`,`reviewedId`,`offerId`) USING BTREE,
  ADD KEY `p2pReviewReviewedIdFkey` (`reviewedId`) USING BTREE,
  ADD KEY `p2pReviewOfferIdFkey` (`offerId`) USING BTREE;

--
-- Indexes for table `p2p_trade`
--
ALTER TABLE `p2p_trade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `p2pTradeIdKey` (`id`) USING BTREE,
  ADD KEY `p2pTradeUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `p2pTradeSellerIdFkey` (`sellerId`) USING BTREE,
  ADD KEY `p2pTradeOfferIdFkey` (`offerId`) USING BTREE;

--
-- Indexes for table `page`
--
ALTER TABLE `page`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pageSlugKey` (`slug`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `postSlugKey` (`slug`),
  ADD KEY `postsCategoryIdForeign` (`categoryId`) USING BTREE,
  ADD KEY `postsAuthorIdForeign` (`authorId`) USING BTREE;

--
-- Indexes for table `post_tag`
--
ALTER TABLE `post_tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `postTagPostIdForeign` (`postId`) USING BTREE,
  ADD KEY `postTagTagIdForeign` (`tagId`) USING BTREE;

--
-- Indexes for table `provider_user`
--
ALTER TABLE `provider_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `providerUserId` (`providerUserId`),
  ADD KEY `ProviderUserUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roleNameKey` (`name`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permission_permissionId_roleId_unique` (`roleId`,`permissionId`),
  ADD KEY `RolePermissionPermissionIdFkey` (`permissionId`) USING BTREE,
  ADD KEY `RolePermissionRoleIdFkey` (`roleId`) USING BTREE;

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `staking_duration`
--
ALTER TABLE `staking_duration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stakingDurationPoolIdFkey` (`poolId`) USING BTREE;

--
-- Indexes for table `staking_log`
--
ALTER TABLE `staking_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stakingLogIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `uniqueStakingLog` (`userId`,`poolId`,`status`) USING BTREE,
  ADD UNIQUE KEY `uniqueActiveStake` (`userId`,`poolId`,`status`) USING BTREE,
  ADD KEY `stakingLogUserIdFkey` (`userId`) USING BTREE,
  ADD KEY `stakingLogPoolIdFkey` (`poolId`) USING BTREE,
  ADD KEY `durationId` (`durationId`);

--
-- Indexes for table `staking_pool`
--
ALTER TABLE `staking_pool`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stakingPoolIdKey` (`id`) USING BTREE;

--
-- Indexes for table `support_ticket`
--
ALTER TABLE `support_ticket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `supportTicketIdKey` (`id`) USING BTREE,
  ADD KEY `supportTicketUserIdForeign` (`userId`) USING BTREE,
  ADD KEY `agentId` (`agentId`) USING BTREE;

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tagSlugKey` (`slug`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactionIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `transactionReferenceIdKey` (`referenceId`),
  ADD KEY `transactionWalletIdForeign` (`walletId`) USING BTREE,
  ADD KEY `transactionUserIdFkey` (`userId`) USING BTREE;

--
-- Indexes for table `two_factor`
--
ALTER TABLE `two_factor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `twoFactorUserIdFkey` (`userId`),
  ADD UNIQUE KEY `twoFactorUserIdKey` (`userId`) USING BTREE,
  ADD KEY `twoFactorUserIdForeign` (`userId`) USING BTREE;

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`) USING BTREE,
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `UserRoleIdFkey` (`roleId`) USING BTREE;

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `walletIdKey` (`id`) USING BTREE,
  ADD UNIQUE KEY `walletUserIdCurrencyTypeKey` (`userId`,`currency`,`type`) USING BTREE;

--
-- Indexes for table `wallet_data`
--
ALTER TABLE `wallet_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `walletDataWalletIdCurrencyChainKey` (`walletId`,`currency`,`chain`) USING BTREE;

--
-- Indexes for table `wallet_pnl`
--
ALTER TABLE `wallet_pnl`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `withdraw_method`
--
ALTER TABLE `withdraw_method`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notification_template`
--
ALTER TABLE `notification_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_investment`
--
ALTER TABLE `ai_investment`
  ADD CONSTRAINT `ai_investment_ibfk_12184` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ai_investment_ibfk_12185` FOREIGN KEY (`planId`) REFERENCES `ai_investment_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ai_investment_ibfk_12186` FOREIGN KEY (`durationId`) REFERENCES `ai_investment_duration` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ai_investment_plan_duration`
--
ALTER TABLE `ai_investment_plan_duration`
  ADD CONSTRAINT `ai_investment_plan_duration_ibfk_507` FOREIGN KEY (`planId`) REFERENCES `ai_investment_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ai_investment_plan_duration_ibfk_508` FOREIGN KEY (`durationId`) REFERENCES `ai_investment_duration` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `api_key`
--
ALTER TABLE `api_key`
  ADD CONSTRAINT `api_key_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `author`
--
ALTER TABLE `author`
  ADD CONSTRAINT `author_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `binary_order`
--
ALTER TABLE `binary_order`
  ADD CONSTRAINT `binary_order_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `comment_ibfk_7433` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `comment_ibfk_7434` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_discount`
--
ALTER TABLE `ecommerce_discount`
  ADD CONSTRAINT `ecommerce_discount_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `ecommerce_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_order`
--
ALTER TABLE `ecommerce_order`
  ADD CONSTRAINT `ecommerce_order_ibfk_9873` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_order_ibfk_9874` FOREIGN KEY (`shippingId`) REFERENCES `ecommerce_shipping` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_order_ibfk_9875` FOREIGN KEY (`productId`) REFERENCES `ecommerce_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_order_item`
--
ALTER TABLE `ecommerce_order_item`
  ADD CONSTRAINT `ecommerce_order_item_ibfk_89` FOREIGN KEY (`orderId`) REFERENCES `ecommerce_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_order_item_ibfk_90` FOREIGN KEY (`productId`) REFERENCES `ecommerce_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_product`
--
ALTER TABLE `ecommerce_product`
  ADD CONSTRAINT `ecommerce_product_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `ecommerce_category` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_review`
--
ALTER TABLE `ecommerce_review`
  ADD CONSTRAINT `ecommerce_review_ibfk_15703` FOREIGN KEY (`productId`) REFERENCES `ecommerce_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_review_ibfk_15704` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_user_discount`
--
ALTER TABLE `ecommerce_user_discount`
  ADD CONSTRAINT `ecommerce_user_discount_ibfk_2845` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_user_discount_ibfk_2846` FOREIGN KEY (`discountId`) REFERENCES `ecommerce_discount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_wishlist`
--
ALTER TABLE `ecommerce_wishlist`
  ADD CONSTRAINT `ecommerce_wishlist_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecommerce_wishlist_item`
--
ALTER TABLE `ecommerce_wishlist_item`
  ADD CONSTRAINT `ecommerce_wishlist_item_ibfk_14929` FOREIGN KEY (`wishlistId`) REFERENCES `ecommerce_wishlist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ecommerce_wishlist_item_ibfk_14930` FOREIGN KEY (`productId`) REFERENCES `ecommerce_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ecosystem_custodial_wallet`
--
ALTER TABLE `ecosystem_custodial_wallet`
  ADD CONSTRAINT `ecosystem_custodial_wallet_ibfk_1` FOREIGN KEY (`masterWalletId`) REFERENCES `ecosystem_master_wallet` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecosystem_private_ledger`
--
ALTER TABLE `ecosystem_private_ledger`
  ADD CONSTRAINT `ecosystem_private_ledger_ibfk_1` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ecosystem_utxo`
--
ALTER TABLE `ecosystem_utxo`
  ADD CONSTRAINT `ecosystem_utxo_ibfk_1` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `exchange_order`
--
ALTER TABLE `exchange_order`
  ADD CONSTRAINT `exchange_order_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `exchange_watchlist`
--
ALTER TABLE `exchange_watchlist`
  ADD CONSTRAINT `exchange_watchlist_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `faq`
--
ALTER TABLE `faq`
  ADD CONSTRAINT `faq_ibfk_1` FOREIGN KEY (`faqCategoryId`) REFERENCES `faq_category` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `forex_account`
--
ALTER TABLE `forex_account`
  ADD CONSTRAINT `forex_account_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `forex_account_signal`
--
ALTER TABLE `forex_account_signal`
  ADD CONSTRAINT `forex_account_signal_ibfk_1` FOREIGN KEY (`forexAccountId`) REFERENCES `forex_account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `forex_account_signal_ibfk_2` FOREIGN KEY (`forexSignalId`) REFERENCES `forex_signal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forex_investment`
--
ALTER TABLE `forex_investment`
  ADD CONSTRAINT `forex_investment_ibfk_10579` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `forex_investment_ibfk_10580` FOREIGN KEY (`planId`) REFERENCES `forex_plan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `forex_investment_ibfk_10581` FOREIGN KEY (`durationId`) REFERENCES `forex_duration` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `forex_plan_duration`
--
ALTER TABLE `forex_plan_duration`
  ADD CONSTRAINT `forex_plan_duration_ibfk_7015` FOREIGN KEY (`planId`) REFERENCES `forex_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `forex_plan_duration_ibfk_7016` FOREIGN KEY (`durationId`) REFERENCES `forex_duration` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ico_allocation`
--
ALTER TABLE `ico_allocation`
  ADD CONSTRAINT `ico_allocation_ibfk_1` FOREIGN KEY (`tokenId`) REFERENCES `ico_token` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ico_contribution`
--
ALTER TABLE `ico_contribution`
  ADD CONSTRAINT `ico_contribution_ibfk_12295` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ico_contribution_ibfk_12296` FOREIGN KEY (`phaseId`) REFERENCES `ico_phase` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ico_phase`
--
ALTER TABLE `ico_phase`
  ADD CONSTRAINT `ico_phase_ibfk_1` FOREIGN KEY (`tokenId`) REFERENCES `ico_token` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ico_phase_allocation`
--
ALTER TABLE `ico_phase_allocation`
  ADD CONSTRAINT `ico_phase_allocation_ibfk_3929` FOREIGN KEY (`allocationId`) REFERENCES `ico_allocation` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ico_phase_allocation_ibfk_3930` FOREIGN KEY (`phaseId`) REFERENCES `ico_phase` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ico_token`
--
ALTER TABLE `ico_token`
  ADD CONSTRAINT `ico_token_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `ico_project` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `investment`
--
ALTER TABLE `investment`
  ADD CONSTRAINT `investment_ibfk_13985` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `investment_ibfk_13986` FOREIGN KEY (`planId`) REFERENCES `investment_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `investment_ibfk_13987` FOREIGN KEY (`durationId`) REFERENCES `investment_duration` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `investment_ibfk_13988` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `investment_plan_duration`
--
ALTER TABLE `investment_plan_duration`
  ADD CONSTRAINT `investment_plan_duration_ibfk_3157` FOREIGN KEY (`planId`) REFERENCES `investment_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `investment_plan_duration_ibfk_3158` FOREIGN KEY (`durationId`) REFERENCES `investment_duration` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_4683` FOREIGN KEY (`transactionId`) REFERENCES `transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_ibfk_4684` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_ibfk_4685` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `kyc`
--
ALTER TABLE `kyc`
  ADD CONSTRAINT `kyc_ibfk_13551` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `kyc_ibfk_13552` FOREIGN KEY (`templateId`) REFERENCES `kyc_template` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `mailwizard_campaign`
--
ALTER TABLE `mailwizard_campaign`
  ADD CONSTRAINT `mailwizard_campaign_ibfk_1` FOREIGN KEY (`templateId`) REFERENCES `mailwizard_template` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `mlm_binary_node`
--
ALTER TABLE `mlm_binary_node`
  ADD CONSTRAINT `mlm_binary_node_ibfk_4876` FOREIGN KEY (`referralId`) REFERENCES `mlm_referral` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_binary_node_ibfk_4877` FOREIGN KEY (`parentId`) REFERENCES `mlm_binary_node` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_binary_node_ibfk_4878` FOREIGN KEY (`leftChildId`) REFERENCES `mlm_binary_node` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_binary_node_ibfk_4879` FOREIGN KEY (`rightChildId`) REFERENCES `mlm_binary_node` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `mlm_referral`
--
ALTER TABLE `mlm_referral`
  ADD CONSTRAINT `mlm_referral_ibfk_1` FOREIGN KEY (`referrerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_referral_ibfk_2` FOREIGN KEY (`referredId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `mlm_referral_reward`
--
ALTER TABLE `mlm_referral_reward`
  ADD CONSTRAINT `mlm_referral_reward_ibfk_689` FOREIGN KEY (`conditionId`) REFERENCES `mlm_referral_condition` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_referral_reward_ibfk_690` FOREIGN KEY (`referrerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `mlm_unilevel_node`
--
ALTER TABLE `mlm_unilevel_node`
  ADD CONSTRAINT `mlm_unilevel_node_ibfk_13105` FOREIGN KEY (`referralId`) REFERENCES `mlm_referral` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `mlm_unilevel_node_ibfk_13106` FOREIGN KEY (`parentId`) REFERENCES `mlm_unilevel_node` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_commission`
--
ALTER TABLE `p2p_commission`
  ADD CONSTRAINT `p2p_commission_ibfk_1` FOREIGN KEY (`tradeId`) REFERENCES `p2p_trade` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_dispute`
--
ALTER TABLE `p2p_dispute`
  ADD CONSTRAINT `p2p_dispute_ibfk_12769` FOREIGN KEY (`tradeId`) REFERENCES `p2p_trade` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_dispute_ibfk_12770` FOREIGN KEY (`raisedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_escrow`
--
ALTER TABLE `p2p_escrow`
  ADD CONSTRAINT `p2p_escrow_ibfk_1` FOREIGN KEY (`tradeId`) REFERENCES `p2p_trade` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_offer`
--
ALTER TABLE `p2p_offer`
  ADD CONSTRAINT `p2p_offer_ibfk_12957` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_offer_ibfk_12958` FOREIGN KEY (`paymentMethodId`) REFERENCES `p2p_payment_method` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_payment_method`
--
ALTER TABLE `p2p_payment_method`
  ADD CONSTRAINT `p2p_payment_method_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_review`
--
ALTER TABLE `p2p_review`
  ADD CONSTRAINT `p2p_review_ibfk_6427` FOREIGN KEY (`reviewerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_review_ibfk_6428` FOREIGN KEY (`reviewedId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_review_ibfk_6429` FOREIGN KEY (`offerId`) REFERENCES `p2p_offer` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `p2p_trade`
--
ALTER TABLE `p2p_trade`
  ADD CONSTRAINT `p2p_trade_ibfk_17977` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_trade_ibfk_17978` FOREIGN KEY (`sellerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `p2p_trade_ibfk_17979` FOREIGN KEY (`offerId`) REFERENCES `p2p_offer` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `post_ibfk_641` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `post_ibfk_642` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `post_tag`
--
ALTER TABLE `post_tag`
  ADD CONSTRAINT `post_tag_ibfk_343` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `post_tag_ibfk_344` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `provider_user`
--
ALTER TABLE `provider_user`
  ADD CONSTRAINT `provider_user_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_11399` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permission_ibfk_11400` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `staking_duration`
--
ALTER TABLE `staking_duration`
  ADD CONSTRAINT `staking_duration_ibfk_1` FOREIGN KEY (`poolId`) REFERENCES `staking_pool` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `staking_log`
--
ALTER TABLE `staking_log`
  ADD CONSTRAINT `staking_log_ibfk_10576` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `staking_log_ibfk_10577` FOREIGN KEY (`poolId`) REFERENCES `staking_pool` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `staking_log_ibfk_10578` FOREIGN KEY (`durationId`) REFERENCES `staking_duration` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `support_ticket`
--
ALTER TABLE `support_ticket`
  ADD CONSTRAINT `support_ticket_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `support_ticket_ibfk_2` FOREIGN KEY (`agentId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_6459` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_ibfk_6460` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `two_factor`
--
ALTER TABLE `two_factor`
  ADD CONSTRAINT `two_factor_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `wallet`
--
ALTER TABLE `wallet`
  ADD CONSTRAINT `wallet_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `wallet_data`
--
ALTER TABLE `wallet_data`
  ADD CONSTRAINT `wallet_data_ibfk_1` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `wallet_pnl`
--
ALTER TABLE `wallet_pnl`
  ADD CONSTRAINT `wallet_pnl_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
