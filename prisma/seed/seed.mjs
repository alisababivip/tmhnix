import { PrismaClient } from '@prisma/client'
import permissions from './permissions.json' assert { type: 'json' }

const prisma = new PrismaClient()

const FiatCurrencies = [
  {
    code: 'AED',
    name: 'United Arab Emirates Dirham',
    symbol: 'د.إ',
    precision: 2,
  },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', precision: 2 },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', precision: 2 },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', precision: 2 },
  {
    code: 'ANG',
    name: 'Netherlands Antillean Guilder',
    symbol: 'ƒ',
    precision: 2,
  },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', precision: 2 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', precision: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', precision: 2 },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', precision: 2 },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', precision: 2 },
  {
    code: 'BAM',
    name: 'Bosnia-Herzegovina Convertible Mark',
    symbol: 'KM',
    precision: 2,
  },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', precision: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', precision: 2 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', precision: 2 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', precision: 3 },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', precision: 0 },
  { code: 'BMD', name: 'Bermudian Dollar', symbol: '$', precision: 2 },
  { code: 'BND', name: 'Brunei Dollar', symbol: '$', precision: 2 },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', precision: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', precision: 2 },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: '$', precision: 2 },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', precision: 2 },
  { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', precision: 2 },
  { code: 'BYN', name: 'New Belarusian Ruble', symbol: 'Br', precision: 2 },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', precision: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', precision: 2 },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', precision: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', precision: 2 },
  {
    code: 'CLF',
    name: 'Chilean Unit of Account (UF)',
    symbol: 'UF',
    precision: 4,
  },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', precision: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', precision: 2 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', precision: 2 },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', precision: 2 },
  {
    code: 'CUC',
    name: 'Cuban Convertible Peso',
    symbol: '$',
    precision: 2,
  },
  { code: 'CUP', name: 'Cuban Peso', symbol: '₱', precision: 2 },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', precision: 2 },
  {
    code: 'CZK',
    name: 'Czech Republic Koruna',
    symbol: 'Kč',
    precision: 2,
  },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', precision: 0 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', precision: 2 },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', precision: 2 },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', precision: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', precision: 2 },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', precision: 2 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', precision: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', precision: 2 },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$', precision: 2 },
  {
    code: 'FKP',
    name: 'Falkland Islands Pound',
    symbol: '£',
    precision: 2,
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    precision: 2,
  },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', precision: 2 },
  { code: 'GGP', name: 'Guernsey Pound', symbol: '£', precision: 2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', precision: 2 },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', precision: 2 },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', precision: 2 },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', precision: 0 },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', precision: 2 },
  { code: 'GYD', name: 'Guyanaese Dollar', symbol: '$', precision: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', precision: 2 },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', precision: 2 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', precision: 2 },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', precision: 2 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', precision: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', precision: 2 },
  { code: 'ILS', name: 'Israeli New Sheqel', symbol: '₪', precision: 2 },
  { code: 'IMP', name: 'Manx pound', symbol: '£', precision: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', precision: 2 },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', precision: 3 },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', precision: 2 },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', precision: 0 },
  { code: 'JEP', name: 'Jersey Pound', symbol: '£', precision: 2 },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', precision: 2 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', precision: 3 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', precision: 0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh', precision: 2 },
  { code: 'KGS', name: 'Kyrgystani Som', symbol: 'с', precision: 2 },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', precision: 2 },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', precision: 0 },
  { code: 'KPW', name: 'North Korean Won', symbol: '₩', precision: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', precision: 0 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', precision: 3 },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$', precision: 2 },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', precision: 2 },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', precision: 2 },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', precision: 2 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', precision: 2 },
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$', precision: 2 },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', precision: 2 },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', precision: 3 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', precision: 2 },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', precision: 2 },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', precision: 2 },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', precision: 2 },
  { code: 'MMK', name: 'Myanma Kyat', symbol: 'Ks', precision: 2 },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', precision: 2 },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', precision: 2 },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', precision: 2 },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', precision: 2 },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', precision: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', precision: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', precision: 2 },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', precision: 2 },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$', precision: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', precision: 2 },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', precision: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', precision: 2 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', precision: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', precision: 2 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', precision: 3 },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', precision: 2 },
  { code: 'PEN', name: 'Peruvian Nuevo Sol', symbol: 'S/', precision: 2 },
  {
    code: 'PGK',
    name: 'Papua New Guinean Kina',
    symbol: 'K',
    precision: 2,
  },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', precision: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', precision: 2 },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', precision: 2 },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', precision: 0 },
  { code: 'QAR', name: 'Qatari Rial', symbol: 'ر.ق', precision: 2 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', precision: 2 },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', precision: 2 },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', precision: 2 },
  {
    code: 'ANG',
    name: 'Netherlands Antillean Guilder',
    symbol: 'ƒ',
    precision: 2,
  },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', precision: 2 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', precision: 0 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', precision: 2 },
  {
    code: 'MRU',
    name: 'Mauritanian Ouguiya',
    symbol: 'UM',
    precision: 2,
  },
  {
    code: 'SBD',
    name: 'Solomon Islands Dollar',
    symbol: '$',
    precision: 2,
  },
  {
    code: 'SCR',
    name: 'Seychellois Rupee',
    symbol: '₨',
    precision: 2,
  },
  {
    code: 'SDG',
    name: 'Sudanese Pound',
    symbol: '£',
    precision: 2,
  },
  {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    precision: 2,
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: '$',
    precision: 2,
  },
  {
    code: 'SHP',
    name: 'Saint Helena Pound',
    symbol: '£',
    precision: 2,
  },
  {
    code: 'SLL',
    name: 'Sierra Leonean Leone',
    symbol: 'Le',
    precision: 2,
  },
  {
    code: 'SOS',
    name: 'Somali Shilling',
    symbol: 'Sh',
    precision: 2,
  },
  {
    code: 'SRD',
    name: 'Surinamese Dollar',
    symbol: '$',
    precision: 2,
  },
  {
    code: 'SSP',
    name: 'South Sudanese Pound',
    symbol: '£',
    precision: 2,
  },
  {
    code: 'STN',
    name: 'São Tomé and Príncipe Dobra',
    symbol: 'Db',
    precision: 2,
  },
  {
    code: 'SYP',
    name: 'Syrian Pound',
    symbol: '£',
    precision: 2,
  },
  {
    code: 'SZL',
    name: 'Swazi Lilangeni',
    symbol: 'L',
    precision: 2,
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    precision: 2,
  },
  {
    code: 'TJS',
    name: 'Tajikistani Somoni',
    symbol: 'SM',
    precision: 2,
  },
  {
    code: 'TMT',
    name: 'Turkmenistani Manat',
    symbol: 'T',
    precision: 2,
  },
  {
    code: 'TND',
    name: 'Tunisian Dinar',
    symbol: 'د.ت',
    precision: 3,
  },
  {
    code: 'TOP',
    name: 'Tongan Paʻanga',
    symbol: 'T$',
    precision: 2,
  },
  {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    precision: 2,
  },
  {
    code: 'TTD',
    name: 'Trinidad and Tobago Dollar',
    symbol: 'TT$',
    precision: 2,
  },
  {
    code: 'TWD',
    name: 'New Taiwan Dollar',
    symbol: 'NT$',
    precision: 2,
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'Sh',
    precision: 2,
  },
  {
    code: 'UAH',
    name: 'Ukrainian Hryvnia',
    symbol: '₴',
    precision: 2,
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    precision: 0,
  },
  { code: 'USD', name: 'United States Dollar', symbol: '$', precision: 2 },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', precision: 2 },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', precision: 2 },
  {
    code: 'VES',
    name: 'Venezuelan Bolívar',
    symbol: 'Bs.S.',
    precision: 2,
  },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', precision: 0 },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', precision: 0 },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', precision: 2 },
  {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'FCFA',
    precision: 0,
  },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', precision: 2 },
  {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    precision: 0,
  },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', precision: 0 },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', precision: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', precision: 2 },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', precision: 2 },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', precision: 2 },
]

const Pages = [
  {
    title: 'About',
    slug: 'about',
    description: 'This is the about page',
    content: 'This is the about page',
    status: 'PUBLISHED',
  },
  {
    title: 'Contact',
    slug: 'contact',
    description: 'This is the contact page',
    content: 'This is the contact page',
    status: 'PUBLISHED',
  },
  {
    title: 'Terms',
    slug: 'terms',
    description: 'This is the terms page',
    content: 'This is the terms page',
    status: 'PUBLISHED',
  },
  {
    title: 'Privacy',
    slug: 'privacy',
    description: 'This is the privacy page',
    content: 'This is the privacy page',
    status: 'PUBLISHED',
  },
]

const permissionsList = [
  'Access Admin Dashboard',
  'Access Users Management',
  'Access Frontend Management',
  'Access Frontend Editor',
  'Access KYC Management',
  'Access KYC Applications Management',
  'Access KYC Application Details',
  'Access KYC Templates Management',
  'Create KYC Template',
  'Edit KYC Template',
  'Edit Default Layout',
  'Access Permissions Management',
  'Access Roles Management',
  'Edit Role Permissions',
  'Access Financial Management',
  'Access Wallet Management',
  'Access Wallet Details',
  'Access Transaction Logs',
  'Access Transaction Details',
  'Access Exchange Logs',
  'Access Deposit Methods',
  'Create Deposit Methods',
  'Edit Deposit Methods',
  'Access Deposit Gateways',
  'Edit Deposit Gateways',
  'Access Withdraw Methods',
  'Create Withdraw Methods',
  'Edit Withdraw Methods',
  'Access Investment Plans',
  'Create Investment Plans',
  'Edit Investment Plans',
  'Access Investment Logs',
  'Access Blog Management',
  'Access Blog Authors',
  'Access Blog Categories',
  'Access Blog Posts',
  'Create Blog Posts',
  'Edit Blog Posts',
  'Delete Blog Posts',
  'Access Blog Tags',
  'Access System Management',
  'Access Settings',
  'Access General Settings',
  'Access Extensions',
  'Access System Update',
  'Access Menu Management',
  'Access Exchange Wizard',
  'Access Exchange Currencies',
  'Access Exchange Markets',
  'Access KYC Settings',
  'Access Locales Management',
  'Edit Menu',
  'Edit Notification Template',
  'Access Notification Email Test',
  'Access Notification Templates Management',
  'Access Page Editor',
  'Access Binary Trading Settings',
  'Access Exchange Provider Settings',
  'Access Fiat Currencies Management',
  'Access Logo Settings',
  'Access Notification Settings',
  'Access Pages Management',
  'Access Support Ticket Details',
  'Access Support Tickets',
  'Access Extension Details',
  ...permissions,
].map((permission) => ({ name: permission }))

const DepositGateways = [
  {
    name: 'Stripe',
    title: 'Stripe',
    description: 'Payment gateway for credit cards',
    alias: 'stripe',
    type: 'FIAT',
    image: '/img/gateways/stripe.png',
    currencies: {
      USD: 'USD',
      AUD: 'AUD',
      BRL: 'BRL',
      CAD: 'CAD',
      CHF: 'CHF',
      DKK: 'DKK',
      EUR: 'EUR',
      GBP: 'GBP',
      HKD: 'HKD',
      INR: 'INR',
      JPY: 'JPY',
      MXN: 'MXN',
      MYR: 'MYR',
      NOK: 'NOK',
      NZD: 'NZD',
      PLN: 'PLN',
      SEK: 'SEK',
      SGD: 'SGD',
    },
    status: true,
    version: '0.0.1',
  },
  {
    name: 'PayPal',
    title: 'PayPal',
    description: 'Payment gateway for PayPal',
    alias: 'paypal',
    type: 'FIAT',
    image: '/img/gateways/paypal.png',
    currencies: {
      AUD: 'AUD',
      BRL: 'BRL',
      CAD: 'CAD',
      CZK: 'CZK',
      DKK: 'DKK',
      EUR: 'EUR',
      HKD: 'HKD',
      HUF: 'HUF',
      INR: 'INR',
      ILS: 'ILS',
      JPY: 'JPY',
      MYR: 'MYR',
      MXN: 'MXN',
      TWD: 'TWD',
      NZD: 'NZD',
      NOK: 'NOK',
      PHP: 'PHP',
      PLN: 'PLN',
      GBP: 'GBP',
      RUB: 'RUB',
      SGD: 'SGD',
      SEK: 'SEK',
      CHF: 'CHF',
      THB: 'THB',
      USD: '$',
    },
    status: false,
    version: '0.0.1',
  },
]

const Exchanges = [
  {
    name: 'kucoin',
    title: 'KuCoin',
    productId: '6D0DD3C8',
    version: '1.0.0',
    type: 'spot',
  },
  {
    name: 'binance',
    title: 'Binance',
    productId: 'EBAC01EE',
    version: '1.0.0',
    type: 'spot',
  },
  {
    name: 'binanceus',
    title: 'Binance US',
    productId: '2816DB47',
    version: '1.0.0',
    type: 'spot',
  },
]

const predefinedExtensions = [
  {
    product_id: 'B96677A0',
    name: 'ai_trading',
    title: 'AI Trading',
    description: 'AI Trading Addon',
    link: 'https://codecanyon.net/item/bot-investment-addon-for-bicrypto-crypto-trader-investment-subscription/35988984',
    image: 'extensions/ai-trading',
  },
  {
    product_id: 'EB4AADC3',
    name: 'ecosystem',
    title: 'EcoSystem & Native Trading',
    description: 'EcoSystem & Native Trading',
    link: 'https://codecanyon.net/item/ecosystem-native-trading-addon-for-bicrypto/40071914',
    image: 'extensions/ecosystem',
  },
  {
    product_id: 'F8C1C44E',
    name: 'forex',
    title: 'Forex & Investment',
    description: 'Forex & Investment',
    link: 'https://codecanyon.net/item/forex-investment-addon-for-bicrypto/36668679',
    image: 'extensions/forex',
  },
  {
    product_id: '61433370',
    name: 'ico',
    title: 'Token ICO',
    description: 'Token ICO',
    link: 'https://codecanyon.net/item/token-ico-addon-for-bicrypto-token-offers-metamask-bep20-erc20-smart-contracts/36120046',
    image: 'extensions/ico',
  },
  {
    product_id: '5868429E',
    name: 'staking',
    title: 'Staking Crypto',
    description: 'Staking Crypto',
    link: 'https://codecanyon.net/item/staking-crypto-addon-for-bicrypto-staking-investments-any-tokens-networks/37434481',
    image: 'extensions/staking',
  },
  {
    product_id: '90AC59FB',
    name: 'knowledge_base',
    title: 'Knowledge Base & Faqs',
    description: 'Knowledge Base & Faqs',
    link: 'https://codecanyon.net/item/knowledge-base-faqs-addon-for-bicrypto/39166202',
    image: 'extensions/knowledge-base',
  },
  {
    product_id: '6FCAE834',
    name: 'ecommerce',
    title: 'Ecommerce',
    description: 'Ecommerce',
    link: 'https://codecanyon.net/item/ecommerce-addon-for-bicrypto-digital-products-wishlist-licenses/44624493',
    image: 'extensions/ecommerce',
  },
  {
    product_id: 'F47D081C',
    name: 'wallet_connect',
    title: 'Wallet Connect',
    description: 'Wallet Connect',
    link: 'https://codecanyon.net/item/wallet-connect-addon-for-bicrypto-wallet-login-connect/37548018',
    image: 'extensions/wallet-connect',
  },
  {
    product_id: 'DBFE65CA',
    name: 'p2p',
    title: 'Peer To Peer Exchange',
    description: 'Peer To Peer Exchange',
    link: 'https://codecanyon.net/item/p2p-trading-addon-for-bicrypto-p2p-livechat-offers-moderation/44593497',
    image: 'extensions/p2p',
  },
  {
    product_id: 'D29FD60F',
    name: 'mlm',
    title: 'Multi Level Marketing',
    description: 'Multi Level Marketing',
    link: 'https://codecanyon.net/item/multi-level-marketing-addon-for-bicrypto/36667808',
    image: 'extensions/mlm',
  },
  {
    product_id: '02B81D43',
    name: 'mailwizard',
    title: 'MailWizard',
    description: 'MailWizard',
    link: 'https://codecanyon.net/item/mailwiz-addon-for-bicrypto-ai-image-generator-ai-content-generator-dragdrop-email-editor/45613491',
    image: 'extensions/mailwizard',
  },
  {
    product_id: 'C4160F60',
    name: 'swap',
    title: 'Swap',
    description: 'Swap',
    link: null,
  },
]

const faqCategories = [
  'BINARY',
  'AI TRADING',
  'FOREX',
  'ICO',
  'ECOSYSTEM',
  'FRONTEND',
  'STAKING',
  'MLM',
  'P2P',
  'ECOMMERCE',
  'MAILWIZARD',
  'KYC',
  'INVESTMENT',
  'DEPOSIT_SPOT',
  'DEPOSIT_FIAT',
  'WIDTHDRAW_SPOT',
  'WIDTHDRAW_FIAT',
  'TRANSFER',
]

const frontEndSections = [
  {
    section: 'animated_bg',
    title: 'Animated Background',
    status: true,
  },
  {
    section: 'banner',
    title: 'Banner Section',
    content: {
      heading: 'Trading crypto never been easier',
      subtext: {
        part1: 'is the best place to buy and sell cryptocurrency.',
        part2: 'Sign up and get started today.',
      },
      button: 'Start trading',
      image: '/img/banner/devices2.png',
    },
    status: true,
  },
  {
    section: 'features',
    title: 'Features Section',
    content: {
      heading: 'Trade with confidence',
      subtext: {
        part1: 'Discover why',
        part2:
          'stands as the definitive choice for cryptocurrency trading and investment',
      },
      features: [
        {
          title: 'Secure Transactions',
          description:
            'Benefit from state-of-the-art encryption and multi-level security protocols.',
        },
        {
          title: 'Comprehensive Analytics',
          description:
            'Make data-driven decisions with our real-time market analysis and interactive charts.',
        },
        {
          title: 'Unmatched Liquidity',
          description:
            'Trade effortlessly on a platform designed for both novice and experienced traders, with access to the most liquid markets.',
        },
      ],
      image: '/img/background/trading.svg',
    },
    status: true,
  },
  {
    section: 'markets',
    title: 'Markets Section',
    content: {
      heading: 'Markets',
      subtext:
        'Trade the world’s top crypto assets with low fees and many options',
    },
    status: true,
  },
  {
    section: 'steps',
    title: 'Steps Section',
    content: {
      heading: 'Easy to use, powerful and extremely safe',
      steps: [
        {
          step: 'Step 1',
          title: 'Create an account',
          description:
            'Create an account on [site_name] and verify your email address.',
          icon: 'solar:user-id-bold-duotone',
          iconColor: 'text-primary-500',
        },
        {
          step: 'Step 2',
          title: 'Deposit funds',
          description:
            'Deposit funds to your account using your preferred payment method.',
          icon: 'solar:card-recive-bold-duotone',
          iconColor: 'text-success-500',
        },
        {
          step: 'Step 3',
          title: 'Start trading',
          description:
            'Start trading on the world’s leading crypto exchange right now.',
          icon: 'bi:currency-exchange',
          iconColor: 'text-info-500',
        },
      ],
    },
    status: true,
  },
  {
    section: 'call_to_action',
    title: 'Call to Action Section',
    status: true,
  },
  {
    section: 'footer',
    title: 'Footer',
    status: true,
  },
]

const notificationTemplates = [
  {
    id: 1,
    name: 'EmailVerification',
    subject: 'Please verify your email',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You recently created an account at %URL% on %CREATED_AT%. Please verify your email to continue with your account. Please follow the link below to verify your email.</p>\n<p>Follow the link to verify your email: %URL%/confirm/verifyemail?token=%TOKEN%</p>',
    short_codes: '["FIRSTNAME", "CREATED_AT", "TOKEN"]',
    email: true,
  },
  {
    id: 2,
    name: 'PasswordReset',
    subject: 'Password Reset Request',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You requested to reset your password. Please follow the link below. If you did not request to reset your password, disregard this email. Your last login time was: %LAST_LOGIN%.</p>\n<p>This is a one-time password link that will reveal a temporary password.</p>\n<p>Password reset link: %URL%/confirm/password-reset?token=%TOKEN%</p>',
    short_codes: '["FIRSTNAME", "LAST_LOGIN", "TOKEN"]',
    email: true,
  },
  {
    id: 3,
    name: 'EmailTest',
    subject: 'Email System Test',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your email system at %URL% is working as expected. This test email was sent on %TIME%.</p>\n<p>If you did not expect this email, please contact support.</p>',
    short_codes: '["FIRSTNAME", "TIME"]',
    email: true,
  },
  {
    id: 4,
    name: 'KycSubmission',
    subject: 'KYC Submission Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Thank you for submitting your KYC application on %CREATED_AT%. Your application is now under review.</p>\n<p>Level: %LEVEL%</p>\n<p>Status: %STATUS%</p>',
    short_codes: '["FIRSTNAME", "CREATED_AT", "LEVEL", "STATUS"]',
    email: true,
  },
  {
    id: 5,
    name: 'KycUpdate',
    subject: 'KYC Update Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your KYC application has been updated on %UPDATED_AT%. It is now under review again.</p>\n<p>Updated Level: %LEVEL%</p>\n<p>Status: %STATUS%</p>',
    short_codes: '["FIRSTNAME", "UPDATED_AT", "LEVEL", "STATUS"]',
    email: true,
  },
  {
    id: 6,
    name: 'KycApproved',
    subject: 'Your KYC Application has been Approved',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your KYC application submitted on %UPDATED_AT% has been approved.</p>\n<p>Your current level is: %LEVEL%</p>\n<p>Thank you for your cooperation.</p>\n<p>Best regards,</p>\n<p> YourSupport Team</p>',
    short_codes: '["FIRSTNAME", "UPDATED_AT", "LEVEL"]',
    email: true,
  },
  {
    id: 7,
    name: 'KycRejected',
    subject: 'Your KYC Application has been Rejected',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Unfortunately, your KYC application submitted on %UPDATED_AT% has been rejected.</p>\n<p>Reason: %MESSAGE%</p>\n<p>Please contact our support team for more information.</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["FIRSTNAME", "UPDATED_AT", "MESSAGE", "LEVEL"]',
    email: true,
  },
  {
    id: 8,
    name: 'NewInvestmentCreated',
    subject: 'New Investment Created',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have successfully created a new investment in the %PLAN_NAME% plan.</p>\n<p>Amount Invested: %AMOUNT% %CURRENCY%</p>\n<p>Duration: %DURATION% days</p>\n<p>Expected ROI: %ROI%</p>\n<p>Status: %STATUS%</p>',
    short_codes:
      '["FIRSTNAME", "PLAN_NAME", "AMOUNT", "CURRENCY", "DURATION", "ROI", "STATUS"]',
    email: true,
  },
  {
    id: 9,
    name: 'InvestmentUpdated',
    subject: 'Investment Updated',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your investment in the %PLAN_NAME% plan has been updated.</p>\n<p>New Amount: %AMOUNT% %CURRENCY%</p>\n<p>New Duration: %DURATION% days</p>\n<p>New Expected ROI: %ROI%</p>\n<p>Status: %STATUS%</p>',
    short_codes:
      '["FIRSTNAME", "PLAN_NAME", "AMOUNT", "CURRENCY", "DURATION", "ROI", "STATUS"]',
    email: true,
  },
  {
    id: 10,
    name: 'InvestmentCanceled',
    subject: 'Investment Canceled',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your investment in the %PLAN_NAME% plan has been canceled.</p>\n<p>Amount Returned: %AMOUNT% %CURRENCY%</p>\n<p>Status: %STATUS%</p>',
    short_codes: '["FIRSTNAME", "PLAN_NAME", "AMOUNT", "CURRENCY", "STATUS"]',
    email: true,
  },
  {
    id: 11,
    name: 'UserMessage',
    subject: 'New Message From Support',
    email_body:
      '<p>Dear %RECEIVER_NAME%,</p>\n<p>You have a new message from our support team regarding ticket ID: %TICKET_ID%.</p>\n<p>Message:</p>\n<p>%MESSAGE%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["RECEIVER_NAME", "TICKET_ID", "MESSAGE"]',
    email: true,
  },
  {
    id: 12,
    name: 'SupportMessage',
    subject: 'New User Message',
    email_body:
      '<p>Dear %RECEIVER_NAME%,</p>\n<p>You have a new message from %SENDER_NAME% regarding ticket ID: %TICKET_ID%.</p>\n<p>Message:</p>\n<p>%MESSAGE%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["RECEIVER_NAME", "SENDER_NAME", "TICKET_ID", "MESSAGE"]',
    email: true,
  },
  {
    id: 13,
    name: 'FiatWalletTransaction',
    subject: 'Transaction Alert: %TRANSACTION_TYPE%',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have recently made a %TRANSACTION_TYPE% transaction.</p>\n<p>Details:</p>\n<ul>\n<li>Transaction ID: %TRANSACTION_ID%</li>\n<li>Amount: %AMOUNT% %CURRENCY%</li>\n<li>Status: %TRANSACTION_STATUS%</li>\n<li>Current Wallet Balance: %NEW_BALANCE% %CURRENCY%</li>\n<li>Description: %DESCRIPTION%</li>\n</ul>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "TRANSACTION_TYPE", "TRANSACTION_ID", "AMOUNT", "CURRENCY", "TRANSACTION_STATUS", "NEW_BALANCE", "DESCRIPTION"]',
    email: true,
  },
  {
    id: 14,
    name: 'BinaryOrderResult',
    subject: 'Binary Order Result: %RESULT%',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Here is the outcome of your recent binary order (ID: %ORDER_ID%).</p>\n<p><strong>Order Details:</strong></p>\n<ul>\n  <li><strong>Market:</strong> %MARKET%</li>\n  <li><strong>Amount:</strong> %AMOUNT% %CURRENCY%</li>\n  <li><strong>Entry Price:</strong> %ENTRY_PRICE%</li>\n  <li><strong>Closed at Price:</strong> %CLOSE_PRICE%</li>\n</ul>\n<p><strong>Order Outcome:</strong></p>\n<ul>\n  <li><strong>Result:</strong> %RESULT%</li>\n  <li><strong>Profit/Loss:</strong> %PROFIT% %CURRENCY%</li>\n  <li><strong>Side:</strong> %SIDE%</li>\n</ul>\n<p>Thank you for using our platform.</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "ORDER_ID", "RESULT", "MARKET", "AMOUNT", "PROFIT", "SIDE", "CURRENCY", "ENTRY_PRICE", "CLOSE_PRICE"]',
    email: true,
  },
  {
    id: 15,
    name: 'WalletBalanceUpdate',
    subject: 'Wallet Balance Update',
    email_body:
      '<p>Hello %FIRSTNAME%,</p>\n<p>Your wallet balance has been %ACTION% by an admin.</p>\n<p>Details:</p>\n<ul>\n<li>Action: %ACTION%</li>\n<li>Amount: %AMOUNT% %CURRENCY%</li>\n<li>New Balance: %NEW_BALANCE% %CURRENCY%</li>\n</ul>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["FIRSTNAME", "ACTION", "AMOUNT", "CURRENCY", "NEW_BALANCE"]',
    email: true,
  },
  {
    id: 16,
    name: 'TransactionStatusUpdate',
    subject: 'Transaction Status Update: %TRANSACTION_TYPE%',
    email_body:
      '<p>Hello %FIRSTNAME%,</p>\n<p>Your transaction of type %TRANSACTION_TYPE% has been updated.</p>\n<p>Details:</p>\n<ul>\n<li>Transaction ID: %TRANSACTION_ID%</li>\n<li>Status: %TRANSACTION_STATUS%</li>\n<li>Amount: %AMOUNT% %CURRENCY%</li>\n<li>Updated Balance: %NEW_BALANCE% %CURRENCY%</li>\n<li>Note: %NOTE%</li>\n</ul>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "TRANSACTION_TYPE", "TRANSACTION_ID", "TRANSACTION_STATUS", "AMOUNT", "CURRENCY", "NEW_BALANCE", "NOTE"]',
    email: true,
  },
  {
    id: 17,
    name: 'AuthorStatusUpdate',
    subject: 'Author Application Status: %AUTHOR_STATUS%',
    email_body:
      '<p>Hello %FIRSTNAME%,</p>\n<p>Your application to join our Authorship Program has been %AUTHOR_STATUS%.</p>\n<p>Details:</p>\n<ul>\n<li>Application ID: %APPLICATION_ID%</li>\n<li>Status: %AUTHOR_STATUS%</li>\n</ul>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["FIRSTNAME", "AUTHOR_STATUS", "APPLICATION_ID"]',
    email: true,
  },
  {
    id: 18,
    name: 'OutgoingWalletTransfer',
    subject: 'Outgoing Wallet Transfer Confirmation',
    email_body:
      '<p>Hello %FIRSTNAME%,</p>\n<p>You have successfully transferred %AMOUNT% %CURRENCY% to %RECIPIENT_NAME%.</p>\n<p>Your new balance: %NEW_BALANCE% %CURRENCY%</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>',
    short_codes:
      '["FIRSTNAME", "AMOUNT", "CURRENCY", "NEW_BALANCE", "TRANSACTION_ID", "RECIPIENT_NAME"]',
    email: true,
  },
  {
    id: 19,
    name: 'IncomingWalletTransfer',
    subject: 'Incoming Wallet Transfer Confirmation',
    email_body:
      '<p>Hello %FIRSTNAME%,</p>\n<p>You have received %AMOUNT% %CURRENCY% from %SENDER_NAME%.</p>\n<p>Your new balance: %NEW_BALANCE% %CURRENCY%</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>',
    short_codes:
      '["FIRSTNAME", "AMOUNT", "CURRENCY", "NEW_BALANCE", "TRANSACTION_ID", "SENDER_NAME"]',
    email: true,
  },
  {
    id: 20,
    name: 'SpotWalletWithdrawalConfirmation',
    subject: 'Confirmation: Spot Wallet Withdrawal',
    email_body:
      '<p>Dear %FIRSTNAME%,</p><p>You have successfully initiated a withdrawal from your Spot Wallet.</p><p>Details:</p><ul><li>Amount: %AMOUNT% %CURRENCY%</li><li>Address: %ADDRESS%</li><li>Transaction Fee: %FEE%</li><li>Network Chain: %CHAIN%</li><li>Memo: %MEMO%</li><li>Status: %STATUS%</li></ul><p>If you did not make this request, please contact our support immediately.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "AMOUNT", "CURRENCY", "ADDRESS", "FEE", "CHAIN", "MEMO", "STATUS"]',
    email: true,
  },
  {
    id: 21,
    name: 'SpotWalletDepositConfirmation',
    subject: 'Confirmation: Spot Wallet Deposit',
    email_body:
      '<p>Dear %FIRSTNAME%,</p><p>Your spot wallet deposit has been successfully processed.</p><p>Details:</p><ul><li>Transaction ID: %TRANSACTION_ID%</li><li>Amount: %AMOUNT% %CURRENCY%</li><li>Network Chain: %CHAIN%</li><li>Transaction Fee: %FEE%</li><li>Status: COMPLETED</li></ul><p>If you did not make this deposit, please contact our support immediately.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "TRANSACTION_ID", "AMOUNT", "CURRENCY", "CHAIN", "FEE"]',
    email: true,
  },
  {
    id: 22,
    name: 'NewAiInvestmentCreated',
    subject: 'New AI Investment Initiated',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have successfully created a new AI investment in the %PLAN_NAME% plan.</p>\n<p>Amount Invested: %AMOUNT% %CURRENCY%</p>\n<p>Duration: %DURATION% %TIMEFRAME%</p>\n<p>Status: %STATUS%</p>',
    short_codes:
      '["FIRSTNAME", "PLAN_NAME", "AMOUNT", "CURRENCY", "DURATION", "TIMEFRAME", "STATUS"]',
    email: true,
  },
  {
    id: 23,
    name: 'AiInvestmentCompleted',
    subject: 'AI Investment Completed',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your AI investment in the %PLAN_NAME% plan has been completed.</p>\n<p>Invested Amount: %AMOUNT% %CURRENCY%</p>\n<p>Result: %PROFIT% %CURRENCY%</p>\n<p>Status: %STATUS%</p>',
    short_codes:
      '["FIRSTNAME", "PLAN_NAME","AMOUNT", "PROFIT", "CURRENCY", "STATUS"]',
    email: true,
  },
  {
    id: 24,
    name: 'AiInvestmentCanceled',
    subject: 'AI Investment Canceled',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your AI investment in the %PLAN_NAME% plan has been canceled.</p>\n<p>Amount Refunded: %AMOUNT% %CURRENCY%</p>\n<p>Status: %STATUS%</p>',
    short_codes: '["FIRSTNAME", "PLAN_NAME", "AMOUNT", "CURRENCY", "STATUS"]',
    email: true,
  },
  {
    id: 25,
    name: 'WithdrawalStatus',
    subject: 'Withdrawal Status: %STATUS%',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your withdrawal request has been %STATUS%.</p>\n<p>If the withdrawal is canceled, the reason is: %REASON%.</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>\n<p>Amount: %AMOUNT% %CURRENCY%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "STATUS", "REASON", "TRANSACTION_ID", "AMOUNT", "CURRENCY"]',
    email: true,
  },
  {
    id: 26,
    name: 'DepositConfirmation',
    subject: 'Deposit Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your deposit has been successfully confirmed.</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>\n<p>Amount: %AMOUNT% %CURRENCY%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: '["FIRSTNAME", "TRANSACTION_ID", "AMOUNT", "CURRENCY"]',
    email: true,
  },
  {
    id: 27,
    name: 'TransferConfirmation',
    subject: 'Transfer Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your transfer has been successfully completed.</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>\n<p>Amount: %AMOUNT% %CURRENCY%</p>\n<p>To: %RECIPIENT_NAME%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes:
      '["FIRSTNAME", "TRANSACTION_ID", "AMOUNT", "CURRENCY", "RECIPIENT_NAME"]',
    email: true,
  },
  {
    id: 28,
    name: 'NewForexInvestmentCreated',
    subject: 'New Forex Investment Initiated',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have successfully created a new Forex investment in the %PLAN_NAME% plan.</p>\n<p>Amount Invested: %AMOUNT%</p>\n<p>Duration: %DURATION% %TIMEFRAME%</p>\n<p>Status: %STATUS%</p>',
    short_codes: [
      'FIRSTNAME',
      'PLAN_NAME',
      'AMOUNT',
      'DURATION',
      'TIMEFRAME',
      'STATUS',
    ],
    email: true,
  },
  {
    id: 29,
    name: 'ForexInvestmentCompleted',
    subject: 'Forex Investment Completed',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your Forex investment in the %PLAN_NAME% plan has been completed.</p>\n<p>Invested Amount: %AMOUNT%</p>\n<p>Result: %PROFIT%</p>\n<p>Status: %STATUS%</p>',
    short_codes: ['FIRSTNAME', 'PLAN_NAME', 'AMOUNT', 'PROFIT', 'STATUS'],
    email: true,
  },
  {
    id: 30,
    name: 'ForexInvestmentCanceled',
    subject: 'Forex Investment Canceled',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>Your Forex investment in the %PLAN_NAME% plan has been canceled.</p>\n<p>Amount Refunded: %AMOUNT%</p>\n<p>Status: %STATUS%</p>',
    short_codes: ['FIRSTNAME', 'PLAN_NAME', 'AMOUNT', 'STATUS'],
    email: true,
  },
  {
    id: 31,
    name: 'ForexDepositConfirmation',
    subject: 'Forex Deposit Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have successfully deposited into your Forex account.</p>\n<p>Account ID: %ACCOUNT_ID%</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>\n<p>Amount: %AMOUNT% %CURRENCY%</p>\n<p>Status: %STATUS%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: [
      'FIRSTNAME',
      'ACCOUNT_ID',
      'TRANSACTION_ID',
      'AMOUNT',
      'CURRENCY',
      'STATUS',
    ],
    email: true,
  },
  {
    id: 32,
    name: 'ForexWithdrawalConfirmation',
    subject: 'Forex Withdrawal Confirmation',
    email_body:
      '<p>Dear %FIRSTNAME%,</p>\n<p>You have successfully withdrawn from your Forex account.</p>\n<p>Account ID: %ACCOUNT_ID%</p>\n<p>Transaction ID: %TRANSACTION_ID%</p>\n<p>Amount: %AMOUNT% %CURRENCY%</p>\n<p>Status: %STATUS%</p>\n<p>Best regards,</p>\n<p>Your Support Team</p>',
    short_codes: [
      'FIRSTNAME',
      'ACCOUNT_ID',
      'TRANSACTION_ID',
      'AMOUNT',
      'CURRENCY',
      'STATUS',
    ],
    email: true,
  },
  {
    id: 33,
    name: 'IcoNewContribution',
    subject: 'Confirmation of Your ICO Contribution',
    email_body: `
      <p>Dear %FIRSTNAME%,</p>
      <p>Thank you for your contribution to the %TOKEN_NAME% ICO.</p>
      <p>Details of your contribution:</p>
      <ul>
        <li>Token: %TOKEN_NAME%</li>
        <li>Phase: %PHASE_NAME%</li>
        <li>Amount: %AMOUNT% %CURRENCY%</li>
        <li>Contribution Status: %CONTRIBUTION_STATUS%</li>
        <li>Date: %DATE%</li>
      </ul>
      <p>If you have any questions, please feel free to reach out to us.</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: [
      'FIRSTNAME',
      'TOKEN_NAME',
      'PHASE_NAME',
      'AMOUNT',
      'CURRENCY',
      'CONTRIBUTION_STATUS',
      'DATE',
    ],
    email: true,
  },
  {
    id: 34,
    name: 'IcoContributionPaid',
    subject: 'Your ICO Contribution Tokens Have Been Dispatched',
    email_body: `
      <p>Dear %FIRSTNAME%,</p>
      <p>We are pleased to inform you that the tokens for your contribution to the %TOKEN_NAME% ICO have been dispatched.</p>
      <p>Details of your transaction:</p>
      <ul>
        <li>Token: %TOKEN_NAME%</li>
        <li>Phase: %PHASE_NAME%</li>
        <li>Amount: %AMOUNT% %CURRENCY%</li>
        <li>Transaction ID: %TRANSACTION_ID%</li>
        <li>Date: %DATE%</li>
      </ul>
      <p>Please check your wallet to confirm the receipt of your tokens.</p>
      <p>If you have any questions or did not receive your tokens, please contact support immediately.</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: [
      'FIRSTNAME',
      'TOKEN_NAME',
      'PHASE_NAME',
      'AMOUNT',
      'CURRENCY',
      'TRANSACTION_ID',
      'DATE',
    ],
    email: true,
  },
  {
    id: 35,
    name: 'StakingInitiationConfirmation',
    subject: 'Confirmation of Your Staking Initiation',
    email_body: `
      <p>Dear %FIRSTNAME%,</p>
      <p>Your staking has been successfully initiated.</p>
      <p>Details of your stake:</p>
      <ul>
        <li>Token: %TOKEN_NAME%</li>
        <li>Amount: %STAKE_AMOUNT% %TOKEN_SYMBOL%</li>
        <li>Stake Date: %STAKE_DATE%</li>
        <li>Release Date: %RELEASE_DATE%</li>
        <li>Expected Reward: %EXPECTED_REWARD% %TOKEN_SYMBOL%</li>
      </ul>
      <p>Your funds are now earning rewards!</p>
      <p>If you have any questions, please feel free to reach out to us.</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: [
      'FIRSTNAME',
      'TOKEN_NAME',
      'STAKE_AMOUNT',
      'TOKEN_SYMBOL',
      'STAKE_DATE',
      'RELEASE_DATE',
      'EXPECTED_REWARD',
    ],
    email: true,
  },
  {
    id: 36,
    name: 'StakingRewardDistribution',
    subject: 'Your Staking Rewards Have Been Distributed',
    email_body: `
      <p>Dear %FIRSTNAME%,</p>
      <p>We are pleased to inform you that rewards for your staking have been distributed to your account.</p>
      <p>Details of the reward distribution:</p>
      <ul>
        <li>Token: %TOKEN_NAME%</li>
        <li>Reward Amount: %REWARD_AMOUNT% %TOKEN_SYMBOL%</li>
        <li>Distribution Date: %DISTRIBUTION_DATE%</li>
      </ul>
      <p>Thank you for staking with us, and enjoy your earnings!</p>
      <p>If you have any questions or concerns about your rewards, please contact support.</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: [
      'FIRSTNAME',
      'TOKEN_NAME',
      'REWARD_AMOUNT',
      'TOKEN_SYMBOL',
      'DISTRIBUTION_DATE',
    ],
    email: true,
  },
  {
    id: 37,
    name: 'OrderConfirmation',
    subject: 'Thank You for Your Order!',
    email_body: `
      <p>Dear %CUSTOMER_NAME%,</p>
      <p>Thank you for shopping with us. Your order has been successfully placed.</p>
      <p>Order Details:</p>
      <ul>
        <li>Order Number: %ORDER_NUMBER%</li>
        <li>Order Date: %ORDER_DATE%</li>
        <li>Total Amount: %ORDER_TOTAL%</li>
      </ul>
      <p>You can track your order status in your account.</p>
      <p>If you have any questions, please contact our customer service team.</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: ['CUSTOMER_NAME', 'ORDER_NUMBER', 'ORDER_DATE', 'ORDER_TOTAL'],
    email: true,
  },
  {
    id: 38,
    name: 'OrderStatusUpdate',
    subject: 'Update on Your Order - Action Required',
    email_body: `
      <p>Dear %CUSTOMER_NAME%,</p>
      <p>Your recent order with us (Order No: %ORDER_NUMBER%) has been updated to %ORDER_STATUS%.</p>
      <p>Please find below the details of your purchase:</p>
      <ul>
        %PRODUCT_DETAILS%
      </ul>
      <p>If your order status is 'COMPLETED', your product keys (if applicable) are available and can be accessed through your account or the provided links.</p>
      <p>If you have any questions or require further assistance, please do not hesitate to contact our support team.</p>
      <p>Thank you for choosing our services!</p>
      <p>Best regards,</p>
      <p>Your Support Team</p>
    `,
    short_codes: [
      'CUSTOMER_NAME',
      'ORDER_NUMBER',
      'ORDER_STATUS',
      'PRODUCT_DETAILS',
    ],
    email: true,
  },
  {
    id: 39,
    name: 'P2PTradeSaleConfirmation',
    subject: 'Confirmation of Your P2P Trade Sale',
    email_body:
      '<p>Dear %SELLER_NAME%,</p><p>A trade has been initiated on your offer for %CURRENCY%.</p><p>Trade Details:</p><ul><li>Buyer: %BUYER_NAME%</li><li>Amount: %AMOUNT% %CURRENCY%</li><li>Price: %PRICE%</li><li>Trade ID: %TRADE_ID%</li></ul><p>Please respond to the buyer to proceed with the trade.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: [
      'SELLER_NAME',
      'BUYER_NAME',
      'CURRENCY',
      'AMOUNT',
      'PRICE',
      'TRADE_ID',
    ],
    email: true,
  },
  {
    id: 40,
    name: 'P2PTradeReply',
    subject: 'New Message in Your P2P Trade',
    email_body:
      '<p>Dear %RECEIVER_NAME%,</p><p>You have a new message in your P2P trade with %SENDER_NAME%.</p><p>Trade ID: %TRADE_ID%</p><p>Message:</p><p>%MESSAGE%</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['RECEIVER_NAME', 'SENDER_NAME', 'TRADE_ID', 'MESSAGE'],
    email: true,
  },
  {
    id: 41,
    name: 'P2PDisputeOpened',
    subject: 'Dispute Opened for Your P2P Trade',
    email_body:
      '<p>Dear %PARTICIPANT_NAME%,</p><p>A dispute has been opened for your trade with %OTHER_PARTY_NAME%.</p><p>Trade ID: %TRADE_ID%</p><p>Dispute Reason:</p><p>%DISPUTE_REASON%</p><p>Our support team will review the dispute and contact you shortly.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: [
      'PARTICIPANT_NAME',
      'OTHER_PARTY_NAME',
      'TRADE_ID',
      'DISPUTE_REASON',
    ],
    email: true,
  },
  {
    id: 42,
    name: 'P2PDisputeResolution',
    subject: 'Dispute Resolution Update for Your P2P Trade',
    email_body:
      '<p>Dear %PARTICIPANT_NAME%,</p><p>The dispute for your trade ID: %TRADE_ID% has a new resolution update.</p><p>Resolution Message:</p><p>%RESOLUTION_MESSAGE%</p><p>Please review the resolution and follow any necessary steps.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['PARTICIPANT_NAME', 'TRADE_ID', 'RESOLUTION_MESSAGE'],
    email: true,
  },
  {
    id: 43,
    name: 'P2PDisputeResolving',
    subject: 'Your P2P Trade Dispute is Being Resolved',
    email_body:
      '<p>Dear %PARTICIPANT_NAME%,</p><p>Your trade dispute for Trade ID: %TRADE_ID% is in the process of being resolved.</p><p>Our team is working diligently to resolve the issue. We appreciate your patience.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['PARTICIPANT_NAME', 'TRADE_ID'],
    email: true,
  },
  {
    id: 44,
    name: 'P2PDisputeClosing',
    subject: 'Closure of Your P2P Trade Dispute',
    email_body:
      '<p>Dear %PARTICIPANT_NAME%,</p><p>The dispute for your trade ID: %TRADE_ID% has been closed.</p><p>We hope the resolution was satisfactory. If you have any further questions, please contact our support team.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['PARTICIPANT_NAME', 'TRADE_ID'],
    email: true,
  },
  {
    id: 45,
    name: 'P2PTradeCompletion',
    subject: 'Confirmation of Completed P2P Trade',
    email_body:
      '<p>Dear %SELLER_NAME%,</p><p>Your trade with %BUYER_NAME% for %AMOUNT% %CURRENCY% has been completed successfully.</p><p>Trade ID: %TRADE_ID%</p><p>Thank you for using our P2P platform.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: [
      'SELLER_NAME',
      'BUYER_NAME',
      'AMOUNT',
      'CURRENCY',
      'TRADE_ID',
    ],
    email: true,
  },
  {
    id: 46,
    name: 'P2PTradeCancellation',
    subject: 'Cancellation of Your P2P Trade',
    email_body:
      '<p>Dear %PARTICIPANT_NAME%,</p><p>Your trade ID: %TRADE_ID% has been cancelled.</p><p>If you have any questions or concerns, please contact our support team.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['PARTICIPANT_NAME', 'TRADE_ID'],
    email: true,
  },
  {
    id: 47,
    name: 'P2PTradePaymentConfirmation',
    subject: 'Payment Confirmation for Your P2P Trade',
    email_body:
      '<p>Dear %SELLER_NAME%,</p><p>%BUYER_NAME% has marked the trade ID: %TRADE_ID% as paid.</p><p>Transaction ID: %TRANSACTION_ID%</p><p>Please confirm the payment on your end to complete the trade.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['SELLER_NAME', 'BUYER_NAME', 'TRADE_ID', 'TRANSACTION_ID'],
    email: true,
  },
  {
    id: 48,
    name: 'P2PReviewNotification',
    subject: 'New Review for Your P2P Offer',
    email_body:
      '<p>Dear %SELLER_NAME%,</p><p>You have received a new review for your offer ID: %OFFER_ID%.</p><p>Reviewer: %REVIEWER_NAME%</p><p>Rating: %RATING%</p><p>Comment: %COMMENT%</p><p>Thank you for providing a quality service on our platform.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: [
      'SELLER_NAME',
      'OFFER_ID',
      'REVIEWER_NAME',
      'RATING',
      'COMMENT',
    ],
    email: true,
  },
  {
    id: 49,
    name: 'P2POfferAmountDepletion',
    subject: 'Notification of Offer Amount Depletion',
    email_body:
      '<p>Dear %SELLER_NAME%,</p><p>The available amount for your offer ID: %OFFER_ID% is running low.</p><p>Current Amount: %CURRENT_AMOUNT% %CURRENCY%</p><p>Consider updating your offer to continue trading.</p><p>Best regards,</p><p>Your Support Team</p>',
    short_codes: ['SELLER_NAME', 'OFFER_ID', 'CURRENT_AMOUNT', 'CURRENCY'],
    email: true,
  },
]

async function seedCurrencies() {
  const currencyUpsertPromises = FiatCurrencies.map((item) => {
    return prisma.currency.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        symbol: item.symbol,
        precision: item.precision,
      },
      create: {
        code: item.code,
        name: item.name,
        symbol: item.symbol,
        precision: item.precision,
        price: null,
        status: true,
      },
    })
  })

  await Promise.all(currencyUpsertPromises)
}

async function seedDepositGateways() {
  const depositGatewayUpsertPromises = DepositGateways.map((gateway) => {
    return prisma.deposit_gateway.upsert({
      where: { name: gateway.name },
      update: gateway,
      create: gateway,
    })
  })

  await Promise.all(depositGatewayUpsertPromises)
}

import tokens from './tokenlist.json' assert { type: 'json' }

async function seedEcosystemTokens() {
  const tokenUpsertPromises = []

  Object.keys(tokens).forEach((chain) => {
    tokens[chain].forEach((token) => {
      tokenUpsertPromises.push(
        prisma.ecosystem_token.upsert({
          where: { UniqueContractInChain: { contract: token.address, chain } },
          update: {
            name: token.name,
            currency: token.symbol,
            chain,
            network: token.network || 'mainnet',
            type: token.type,
            contract: token.address,
            decimals: token.decimals,
            icon: token.logoURI,
            contractType: token.contractType || 'NO_PERMIT',
          },
          create: {
            name: token.name,
            currency: token.symbol,
            chain,
            network: token.network || 'mainnet',
            type: token.type,
            contract: token.address,
            decimals: token.decimals,
            status: false,
            icon: token.logoURI,
            contractType: token.contractType || 'NO_PERMIT',
          },
        }),
      )
    })
  })

  await Promise.all(tokenUpsertPromises)
}

async function seedExchanges() {
  const exchangeUpsertPromises = Exchanges.map((exchange) => {
    return prisma.exchange.upsert({
      where: { productId: exchange.productId },
      update: {
        title: exchange.title,
        productId: exchange.productId,
        type: exchange.type,
      },
      create: exchange,
    })
  })

  await Promise.all(exchangeUpsertPromises)
}

async function seedExtensions() {
  const extensionUpsertPromises = predefinedExtensions.map((extension) =>
    prisma.extension.upsert({
      where: { product_id: extension.product_id },
      update: {
        name: extension.name,
        title: extension.title,
        description: extension.description,
        link: extension.link,
        image: extension.image,
        product_id: extension.product_id,
      },
      create: extension,
    }),
  )

  await Promise.all([...extensionUpsertPromises])
}

async function seedFaqCategories() {
  const categoryUpserts = faqCategories.map((identifier) => {
    return prisma.faq_category.upsert({
      where: { identifier },
      update: {},
      create: { identifier },
    })
  })

  await Promise.all(categoryUpserts)
}

async function seedFrontend() {
  for (const section of frontEndSections) {
    // Check if section already exists
    const existingSection = await prisma.frontend.findUnique({
      where: {
        section: section.section,
      },
    })

    // If section does not exist, create it
    if (!existingSection) {
      await prisma.frontend.create({
        data: section,
      })
    }
  }
}

async function seedPages() {
  const pageUpsertPromises = Pages.map((page) => {
    return prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  })

  await Promise.all(pageUpsertPromises)
}

async function seedPermissions() {
  // Fetch existing permissions from the database
  const existingPermissions = await prisma.permission.findMany({
    select: { id: true, name: true },
  })

  // Create a Set of existing permission names
  const existingPermissionNames = new Set(
    existingPermissions.map((perm) => perm.name),
  )
  const duplicatePermissionIds = []

  for (const { id, name } of existingPermissions) {
    if (existingPermissionNames.has(name)) {
      duplicatePermissionIds.push(id)
    } else {
      existingPermissionNames.add(name)
    }
  }

  // Filter out the permissions that already exist in the database
  const newPermissions = permissionsList
    .filter((perm) => !existingPermissionNames.has(perm.name))
    .map((permission) => ({ name: permission.name }))

  if (newPermissions.length > 0) {
    await prisma.permission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    })
  }
}

const rolesList = ['Super Admin', 'Admin', 'Support', 'User'].map((role) => ({
  name: role,
}))

async function seedRoles() {
  await prisma.role.createMany({
    data: rolesList,
    skipDuplicates: true, // Skips records with duplicate names
  })
}

import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'

async function hashPassword(password) {
  try {
    return await argon2.hash(password)
  } catch (err) {
    console.error(`Error hashing password: ${err.message}`)
    throw new Error('Failed to hash password')
  }
}

function makeUuid() {
  return uuidv4()
}

async function seedSuperAdmin() {
  // Check if a Super Admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: {
        name: 'Super Admin',
      },
    },
  })

  if (existingSuperAdmin) {
    console.log(
      'A Super Admin already exists. No new Super Admin will be created.',
    )
    return
  }

  // Retrieve the ID of the Super Admin role
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: 'Super Admin',
    },
    select: {
      id: true,
    },
  })

  if (!superAdminRole) {
    console.error('Super Admin role not found. Exiting.')
    return
  }

  const superAdminRoleId = superAdminRole.id

  // Create a user with the Super Admin role
  await prisma.user.create({
    data: {
      uuid: makeUuid(),
      email: 'superadmin@example.com',
      password: await hashPassword('12345678'),
      first_name: 'Super',
      last_name: 'Admin',
      email_verified: true,
      is_active: true,
      role_id: superAdminRoleId,
    },
  })

  console.log('Super Admin has been successfully created.')
}

async function seedNotificationTemplates() {
  const emailTemplatePromises = notificationTemplates.map((template) => {
    return prisma.notification_templates.upsert({
      where: { id: template.id },
      update: { short_codes: template.short_codes },
      create: template,
    })
  })
  await Promise.all(emailTemplatePromises)
}

async function seedUsersWithBinaryTree() {
  await prisma.$transaction(async (prisma) => {
    let userPromises = []
    let binaryNodePromises = []

    // Seed 25 users
    for (let i = 0; i < 25; i++) {
      const hashedPassword = await hashPassword('12345678')

      let userPromise = prisma.user.create({
        data: {
          uuid: makeUuid(),
          email: `user${i}@example.com`,
          password: hashedPassword,
          first_name: `User`,
          last_name: `${i}`,
          is_active: true,
          role_id: 44,
        },
      })

      userPromises.push(userPromise)
    }

    const users = await Promise.all(userPromises)
    let binaryNodes = [null] // Initialize with null for the root user

    users.forEach((user, i) => {
      if (i === 0) return // Skip the first user (root)

      const parentIndex = Math.floor((i - 1) / 2)
      const position = i % 2 === 0 ? 'right_child_id' : 'left_child_id'

      let binaryNodePromise = prisma.mlm_referral
        .create({
          data: {
            referrer: { connect: { uuid: users[parentIndex].uuid } },
            referred: { connect: { uuid: user.uuid } },
            status: 'ACTIVE',
          },
        })
        .then((referral) => {
          return prisma.mlm_binary_node.create({
            data: {
              referral_id: referral.id,
            },
          })
        })
        .then((binaryNode) => {
          binaryNodes[i] = binaryNode

          return prisma.mlm_binary_node.update({
            where: { id: binaryNodes[parentIndex].id },
            data: {
              [position]: binaryNode.id,
            },
          })
        })
        .then(() => {
          return prisma.mlm_binary_node.update({
            where: { id: binaryNodes[i].id },
            data: {
              parent_id: binaryNodes[parentIndex].id,
            },
          })
        })

      binaryNodePromises.push(binaryNodePromise)
    })

    await Promise.all(binaryNodePromises)
  })
}

const predefinedConditions = [
  {
    type: 'DEPOSIT',
    name: 'WELCOME_BONUS',
    title: 'Welcome Deposit Bonus',
    description: 'A welcome bonus for the first deposit of at least 100 USDT',
    reward: 10,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'TRADE',
    name: 'MONTHLY_TRADE_VOLUME',
    title: 'Monthly Trade Volume Bonus',
    description:
      'A reward for users who trade more than 1,000 USDT in a month.',
    reward: 50,
    reward_type: 'FIXED',
  },
  {
    type: 'TRADE',
    name: 'TRADE_COMMISSION',
    title: 'Trade Commission Reward',
    description: 'A commission for the broker on every trade executed.',
    reward: 0.1,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'INVESTENT',
    name: 'INVESTENT',
    title: 'Investment Bonus',
    description: 'A bonus for investing in the company.',
    reward: 5,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'AI_INVESTMENT',
    name: 'AI_INVESTMENT',
    title: 'AI Managed Portfolio Bonus',
    description: 'Bonus for investing in AI managed portfolios.',
    reward: 2,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'FOREX_INVESTMENT',
    name: 'FOREX_INVESTMENT',
    title: 'Forex Investment Bonus',
    description: 'Bonus for investing in Forex.',
    reward: 100,
    reward_type: 'FIXED',
  },
  {
    type: 'ICO_CONTRIBUTION',
    name: 'ICO_CONTRIBUTION',
    title: 'ICO Participation Bonus',
    description:
      'A special bonus for contributing to an Initial Coin Offering.',
    reward: 15,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'STAKING',
    name: 'STAKING_LOYALTY',
    title: 'Staking Loyalty Bonus',
    description:
      'A loyalty bonus for users who stake their coins for a certain period.',
    reward: 3,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'ECOMMERCE_PURCHASE',
    name: 'ECOMMERCE_PURCHASE',
    title: 'Ecommerce Shopping Reward',
    description:
      'Cashback reward for purchases made on the ecommerce platform.',
    reward: 5,
    reward_type: 'PERCENTAGE',
  },
  {
    type: 'P2P_TRADE',
    name: 'P2P_TRADE',
    title: 'P2P Trading Reward',
    description: 'A reward for trading on the P2P platform.',
    reward: 1,
    reward_type: 'PERCENTAGE',
  },
]

async function seedRewardConditions() {
  const conditionUpsertPromises = predefinedConditions.map((condition) =>
    prisma.mlm_referral_condition.upsert({
      where: { name: condition.name },
      update: {},
      create: {
        type: condition.type,
        title: condition.title,
        name: condition.name,
        description: condition.description,
        reward: condition.reward,
        reward_type: condition.reward_type,
        reward_wallet_type: 'FIAT',
        reward_currency: 'USD',
        reward_chain: null,
      },
    }),
  )

  await Promise.all(conditionUpsertPromises)
}

async function main() {
  try {
    // await seedUsersWithBinaryTree()
    await seedCurrencies()
    await seedDepositGateways()
    await seedEcosystemTokens()
    await seedExchanges()
    await seedExtensions()
    await seedFaqCategories()
    await seedFrontend()
    await seedPages()
    await seedPermissions()
    await seedRoles()
    await seedSuperAdmin()
    await seedNotificationTemplates()
    await seedRewardConditions()
    console.log('Seeding completed successfully.')
  } catch (e) {
    console.error(`Error during seeding: ${e.message}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
