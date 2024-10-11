"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2PDiputeStatus = exports.P2PEscrowStatus = exports.P2PTradeStatus = exports.P2POfferStatus = exports.EcommerceOrderStatus = exports.EcommerceDiscountStatus = exports.EcommerceReviewStatus = exports.EcommerceCategoryStatus = exports.EcommerceProductStatus = exports.RewardStatus = exports.StakeStatus = exports.StakingStatus = exports.ReferralConditionType = exports.ReferralStatus = exports.IcoAllocationStatus = exports.IcoContributionStatus = exports.IcoPhaseStatus = exports.IcoTokenStatus = exports.IcoProjectStatus = exports.ForexSignalStatus = exports.ForexTimeframe = exports.ForexLogType = exports.ForexLogStatus = exports.ForexInvestmentResult = exports.CustodialWalletStatus = exports.EcosystemTimeInForce = exports.EcosystemOrderStatus = exports.EcosystemOrderType = exports.EcosystemOrderSide = exports.AiTradingTimeframe = exports.AiTradingStatus = exports.AiTradingResult = exports.ExchangeWatchlistType = exports.KycStatus = exports.DepositGatewayType = exports.PageStatus = exports.TicketImportance = exports.TicketStatus = exports.InvestmentStatus = exports.BinaryOrderStatus = exports.BinaryOrderType = exports.BinaryOrderSide = exports.ExchangeTimeInForce = exports.ExchangeOrderStatus = exports.ExchangeOrderType = exports.ExchangeOrderSide = exports.TransactionStatus = exports.TransactionType = exports.EcosystemTokenContractType = exports.WalletType = void 0;
exports.MlmReferralConditionRewardType = exports.MlmReferralConditionType = exports.MlmReferralStatus = void 0;
var WalletType;
(function (WalletType) {
    WalletType["FIAT"] = "FIAT";
    WalletType["SPOT"] = "SPOT";
    WalletType["ECO"] = "ECO";
})(WalletType || (exports.WalletType = WalletType = {}));
var EcosystemTokenContractType;
(function (EcosystemTokenContractType) {
    EcosystemTokenContractType["PERMIT"] = "PERMIT";
    EcosystemTokenContractType["NO_PERMIT"] = "NO_PERMIT";
    EcosystemTokenContractType["NATIVE"] = "NATIVE";
})(EcosystemTokenContractType || (exports.EcosystemTokenContractType = EcosystemTokenContractType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["FAILED"] = "FAILED";
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAW"] = "WITHDRAW";
    TransactionType["OUTGOING_TRANSFER"] = "OUTGOING_TRANSFER";
    TransactionType["INCOMING_TRANSFER"] = "INCOMING_TRANSFER";
    TransactionType["PAYMENT"] = "PAYMENT";
    TransactionType["REFUND"] = "REFUND";
    TransactionType["BINARY_ORDER"] = "BINARY_ORDER";
    TransactionType["EXCHANGE_ORDER"] = "EXCHANGE_ORDER";
    TransactionType["INVESTMENT"] = "INVESTMENT";
    TransactionType["INVESTMENT_ROI"] = "INVESTMENT_ROI";
    TransactionType["AI_INVESTMENT"] = "AI_INVESTMENT";
    TransactionType["AI_INVESTMENT_ROI"] = "AI_INVESTMENT_ROI";
    TransactionType["INVOICE"] = "INVOICE";
    TransactionType["FOREX_DEPOSIT"] = "FOREX_DEPOSIT";
    TransactionType["FOREX_WITHDRAW"] = "FOREX_WITHDRAW";
    TransactionType["FOREX_INVESTMENT"] = "FOREX_INVESTMENT";
    TransactionType["FOREX_INVESTMENT_ROI"] = "FOREX_INVESTMENT_ROI";
    TransactionType["ICO_CONTRIBUTION"] = "ICO_CONTRIBUTION";
    TransactionType["REFERRAL_REWARD"] = "REFERRAL_REWARD";
    TransactionType["STAKING"] = "STAKING";
    TransactionType["STAKING_REWARD"] = "STAKING_REWARD";
    TransactionType["P2P_OFFER_TRANSFER"] = "P2P_OFFER_TRANSFER";
    TransactionType["P2P_TRADE"] = "P2P_TRADE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["EXPIRED"] = "EXPIRED";
    TransactionStatus["REJECTED"] = "REJECTED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
    TransactionStatus["TIMEOUT"] = "TIMEOUT";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var ExchangeOrderSide;
(function (ExchangeOrderSide) {
    ExchangeOrderSide["BUY"] = "BUY";
    ExchangeOrderSide["SELL"] = "SELL";
})(ExchangeOrderSide || (exports.ExchangeOrderSide = ExchangeOrderSide = {}));
var ExchangeOrderType;
(function (ExchangeOrderType) {
    ExchangeOrderType["MARKET"] = "MARKET";
    ExchangeOrderType["LIMIT"] = "LIMIT";
})(ExchangeOrderType || (exports.ExchangeOrderType = ExchangeOrderType = {}));
var ExchangeOrderStatus;
(function (ExchangeOrderStatus) {
    ExchangeOrderStatus["OPEN"] = "OPEN";
    ExchangeOrderStatus["CLOSED"] = "CLOSED";
    ExchangeOrderStatus["CANCELED"] = "CANCELED";
    ExchangeOrderStatus["EXPIRED"] = "EXPIRED";
    ExchangeOrderStatus["REJECTED"] = "REJECTED";
})(ExchangeOrderStatus || (exports.ExchangeOrderStatus = ExchangeOrderStatus = {}));
var ExchangeTimeInForce;
(function (ExchangeTimeInForce) {
    ExchangeTimeInForce["GTC"] = "GTC";
    ExchangeTimeInForce["IOC"] = "IOC";
    ExchangeTimeInForce["FOK"] = "FOK";
    ExchangeTimeInForce["PO"] = "PO";
})(ExchangeTimeInForce || (exports.ExchangeTimeInForce = ExchangeTimeInForce = {}));
var BinaryOrderSide;
(function (BinaryOrderSide) {
    BinaryOrderSide["RISE"] = "RISE";
    BinaryOrderSide["FALL"] = "FALL";
})(BinaryOrderSide || (exports.BinaryOrderSide = BinaryOrderSide = {}));
var BinaryOrderType;
(function (BinaryOrderType) {
    BinaryOrderType["RISE_FALL"] = "RISE_FALL";
})(BinaryOrderType || (exports.BinaryOrderType = BinaryOrderType = {}));
var BinaryOrderStatus;
(function (BinaryOrderStatus) {
    BinaryOrderStatus["PENDING"] = "PENDING";
    BinaryOrderStatus["WIN"] = "WIN";
    BinaryOrderStatus["LOSS"] = "LOSS";
    BinaryOrderStatus["DRAW"] = "DRAW";
    BinaryOrderStatus["CANCELLED"] = "CANCELLED";
    BinaryOrderStatus["REJECTED"] = "REJECTED";
    BinaryOrderStatus["EXPIRED"] = "EXPIRED";
})(BinaryOrderStatus || (exports.BinaryOrderStatus = BinaryOrderStatus = {}));
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["PENDING"] = "PENDING";
    InvestmentStatus["ACTIVE"] = "ACTIVE";
    InvestmentStatus["COMPLETED"] = "COMPLETED";
    InvestmentStatus["CANCELLED"] = "CANCELLED";
    InvestmentStatus["REJECTED"] = "REJECTED";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["PENDING"] = "PENDING";
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["REPLIED"] = "REPLIED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketImportance;
(function (TicketImportance) {
    TicketImportance["LOW"] = "LOW";
    TicketImportance["MEDIUM"] = "MEDIUM";
    TicketImportance["HIGH"] = "HIGH";
})(TicketImportance || (exports.TicketImportance = TicketImportance = {}));
var PageStatus;
(function (PageStatus) {
    PageStatus["PUBLISHED"] = "PUBLISHED";
    PageStatus["DRAFT"] = "DRAFT";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
var DepositGatewayType;
(function (DepositGatewayType) {
    DepositGatewayType["FIAT"] = "FIAT";
    DepositGatewayType["CRYPTO"] = "CRYPTO";
})(DepositGatewayType || (exports.DepositGatewayType = DepositGatewayType = {}));
// KYC Status Enum
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["APPROVED"] = "APPROVED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var ExchangeWatchlistType;
(function (ExchangeWatchlistType) {
    ExchangeWatchlistType["TRADE"] = "TRADE";
    ExchangeWatchlistType["BINARY"] = "BINARY";
    ExchangeWatchlistType["AI_TRADING"] = "AI_TRADING";
    ExchangeWatchlistType["FOREX"] = "FOREX";
    ExchangeWatchlistType["STOCK"] = "STOCK";
    ExchangeWatchlistType["FUTURES"] = "FUTURES";
})(ExchangeWatchlistType || (exports.ExchangeWatchlistType = ExchangeWatchlistType = {}));
var AiTradingResult;
(function (AiTradingResult) {
    AiTradingResult["WIN"] = "WIN";
    AiTradingResult["LOSS"] = "LOSS";
    AiTradingResult["DRAW"] = "DRAW";
})(AiTradingResult || (exports.AiTradingResult = AiTradingResult = {}));
var AiTradingStatus;
(function (AiTradingStatus) {
    AiTradingStatus["PENDING"] = "PENDING";
    AiTradingStatus["ACTIVE"] = "ACTIVE";
    AiTradingStatus["COMPLETED"] = "COMPLETED";
    AiTradingStatus["CANCELLED"] = "CANCELLED";
    AiTradingStatus["REJECTED"] = "REJECTED";
})(AiTradingStatus || (exports.AiTradingStatus = AiTradingStatus = {}));
var AiTradingTimeframe;
(function (AiTradingTimeframe) {
    AiTradingTimeframe["HOUR"] = "HOUR";
    AiTradingTimeframe["DAY"] = "DAY";
    AiTradingTimeframe["WEEK"] = "WEEK";
    AiTradingTimeframe["MONTH"] = "MONTH";
})(AiTradingTimeframe || (exports.AiTradingTimeframe = AiTradingTimeframe = {}));
// Ecosystem Order Side
var EcosystemOrderSide;
(function (EcosystemOrderSide) {
    EcosystemOrderSide["BUY"] = "BUY";
    EcosystemOrderSide["SELL"] = "SELL";
})(EcosystemOrderSide || (exports.EcosystemOrderSide = EcosystemOrderSide = {}));
// Ecosystem Order Type
var EcosystemOrderType;
(function (EcosystemOrderType) {
    EcosystemOrderType["MARKET"] = "MARKET";
    EcosystemOrderType["LIMIT"] = "LIMIT";
})(EcosystemOrderType || (exports.EcosystemOrderType = EcosystemOrderType = {}));
// Ecosystem Order Status
var EcosystemOrderStatus;
(function (EcosystemOrderStatus) {
    EcosystemOrderStatus["OPEN"] = "OPEN";
    EcosystemOrderStatus["CLOSED"] = "CLOSED";
    EcosystemOrderStatus["CANCELED"] = "CANCELED";
    EcosystemOrderStatus["EXPIRED"] = "EXPIRED";
    EcosystemOrderStatus["REJECTED"] = "REJECTED";
})(EcosystemOrderStatus || (exports.EcosystemOrderStatus = EcosystemOrderStatus = {}));
// Ecosystem Time In Force
var EcosystemTimeInForce;
(function (EcosystemTimeInForce) {
    EcosystemTimeInForce["GTC"] = "GTC";
    EcosystemTimeInForce["IOC"] = "IOC";
    EcosystemTimeInForce["FOK"] = "FOK";
    EcosystemTimeInForce["PO"] = "PO";
})(EcosystemTimeInForce || (exports.EcosystemTimeInForce = EcosystemTimeInForce = {}));
// Enum for CustodialWalletStatus
var CustodialWalletStatus;
(function (CustodialWalletStatus) {
    CustodialWalletStatus["ACTIVE"] = "ACTIVE";
    CustodialWalletStatus["INACTIVE"] = "INACTIVE";
    CustodialWalletStatus["SUSPENDED"] = "SUSPENDED";
})(CustodialWalletStatus || (exports.CustodialWalletStatus = CustodialWalletStatus = {}));
var ForexInvestmentResult;
(function (ForexInvestmentResult) {
    ForexInvestmentResult["WIN"] = "WIN";
    ForexInvestmentResult["LOSS"] = "LOSS";
    ForexInvestmentResult["DRAW"] = "DRAW";
})(ForexInvestmentResult || (exports.ForexInvestmentResult = ForexInvestmentResult = {}));
var ForexLogStatus;
(function (ForexLogStatus) {
    ForexLogStatus["ACTIVE"] = "ACTIVE";
    ForexLogStatus["COMPLETED"] = "COMPLETED";
    ForexLogStatus["CANCELLED"] = "CANCELLED";
    ForexLogStatus["REJECTED"] = "REJECTED";
})(ForexLogStatus || (exports.ForexLogStatus = ForexLogStatus = {}));
var ForexLogType;
(function (ForexLogType) {
    ForexLogType["DEPOSIT"] = "DEPOSIT";
    ForexLogType["WITHDRAW"] = "WITHDRAW";
    ForexLogType["INVESTMENT"] = "INVESTMENT";
    ForexLogType["INVESTMENT_ROI"] = "INVESTMENT_ROI";
})(ForexLogType || (exports.ForexLogType = ForexLogType = {}));
var ForexTimeframe;
(function (ForexTimeframe) {
    ForexTimeframe["HOUR"] = "HOUR";
    ForexTimeframe["DAY"] = "DAY";
    ForexTimeframe["WEEK"] = "WEEK";
    ForexTimeframe["MONTH"] = "MONTH";
})(ForexTimeframe || (exports.ForexTimeframe = ForexTimeframe = {}));
var ForexSignalStatus;
(function (ForexSignalStatus) {
    ForexSignalStatus["ACTIVE"] = "ACTIVE";
    ForexSignalStatus["INACTIVE"] = "INACTIVE";
})(ForexSignalStatus || (exports.ForexSignalStatus = ForexSignalStatus = {}));
var IcoProjectStatus;
(function (IcoProjectStatus) {
    IcoProjectStatus["PENDING"] = "PENDING";
    IcoProjectStatus["ACTIVE"] = "ACTIVE";
    IcoProjectStatus["COMPLETED"] = "COMPLETED";
    IcoProjectStatus["CANCELLED"] = "CANCELLED";
    IcoProjectStatus["REJECTED"] = "REJECTED";
})(IcoProjectStatus || (exports.IcoProjectStatus = IcoProjectStatus = {}));
var IcoTokenStatus;
(function (IcoTokenStatus) {
    IcoTokenStatus["PENDING"] = "PENDING";
    IcoTokenStatus["ACTIVE"] = "ACTIVE";
    IcoTokenStatus["COMPLETED"] = "COMPLETED";
    IcoTokenStatus["REJECTED"] = "REJECTED";
    IcoTokenStatus["CANCELLED"] = "CANCELLED";
})(IcoTokenStatus || (exports.IcoTokenStatus = IcoTokenStatus = {}));
var IcoPhaseStatus;
(function (IcoPhaseStatus) {
    IcoPhaseStatus["PENDING"] = "PENDING";
    IcoPhaseStatus["ACTIVE"] = "ACTIVE";
    IcoPhaseStatus["COMPLETED"] = "COMPLETED";
    IcoPhaseStatus["REJECTED"] = "REJECTED";
    IcoPhaseStatus["CANCELLED"] = "CANCELLED";
})(IcoPhaseStatus || (exports.IcoPhaseStatus = IcoPhaseStatus = {}));
var IcoContributionStatus;
(function (IcoContributionStatus) {
    IcoContributionStatus["PENDING"] = "PENDING";
    IcoContributionStatus["COMPLETED"] = "COMPLETED";
    IcoContributionStatus["REJECTED"] = "REJECTED";
    IcoContributionStatus["CANCELLED"] = "CANCELLED";
})(IcoContributionStatus || (exports.IcoContributionStatus = IcoContributionStatus = {}));
var IcoAllocationStatus;
(function (IcoAllocationStatus) {
    IcoAllocationStatus["PENDING"] = "PENDING";
    IcoAllocationStatus["COMPLETED"] = "COMPLETED";
    IcoAllocationStatus["REJECTED"] = "REJECTED";
    IcoAllocationStatus["CANCELLED"] = "CANCELLED";
})(IcoAllocationStatus || (exports.IcoAllocationStatus = IcoAllocationStatus = {}));
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "PENDING";
    ReferralStatus["ACTIVE"] = "ACTIVE";
    ReferralStatus["REJECTED"] = "REJECTED";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
var ReferralConditionType;
(function (ReferralConditionType) {
    ReferralConditionType["DEPOSIT"] = "DEPOSIT";
    ReferralConditionType["TRADE"] = "TRADE";
    ReferralConditionType["INVEST"] = "INVEST";
})(ReferralConditionType || (exports.ReferralConditionType = ReferralConditionType = {}));
// Enums
var StakingStatus;
(function (StakingStatus) {
    StakingStatus["ACTIVE"] = "ACTIVE";
    StakingStatus["INACTIVE"] = "INACTIVE";
    StakingStatus["COMPLETED"] = "COMPLETED";
})(StakingStatus || (exports.StakingStatus = StakingStatus = {}));
var StakeStatus;
(function (StakeStatus) {
    StakeStatus["ACTIVE"] = "ACTIVE";
    StakeStatus["RELEASED"] = "RELEASED";
    StakeStatus["WITHDRAWN"] = "WITHDRAWN";
})(StakeStatus || (exports.StakeStatus = StakeStatus = {}));
var RewardStatus;
(function (RewardStatus) {
    RewardStatus["PENDING"] = "PENDING";
    RewardStatus["DISTRIBUTED"] = "DISTRIBUTED";
})(RewardStatus || (exports.RewardStatus = RewardStatus = {}));
// Enums
var EcommerceProductStatus;
(function (EcommerceProductStatus) {
    EcommerceProductStatus["ACTIVE"] = "ACTIVE";
    EcommerceProductStatus["INACTIVE"] = "INACTIVE";
})(EcommerceProductStatus || (exports.EcommerceProductStatus = EcommerceProductStatus = {}));
var EcommerceCategoryStatus;
(function (EcommerceCategoryStatus) {
    EcommerceCategoryStatus["ACTIVE"] = "ACTIVE";
    EcommerceCategoryStatus["INACTIVE"] = "INACTIVE";
})(EcommerceCategoryStatus || (exports.EcommerceCategoryStatus = EcommerceCategoryStatus = {}));
var EcommerceReviewStatus;
(function (EcommerceReviewStatus) {
    EcommerceReviewStatus["ACTIVE"] = "ACTIVE";
    EcommerceReviewStatus["INACTIVE"] = "INACTIVE";
})(EcommerceReviewStatus || (exports.EcommerceReviewStatus = EcommerceReviewStatus = {}));
var EcommerceDiscountStatus;
(function (EcommerceDiscountStatus) {
    EcommerceDiscountStatus["ACTIVE"] = "ACTIVE";
    EcommerceDiscountStatus["INACTIVE"] = "INACTIVE";
})(EcommerceDiscountStatus || (exports.EcommerceDiscountStatus = EcommerceDiscountStatus = {}));
var EcommerceOrderStatus;
(function (EcommerceOrderStatus) {
    EcommerceOrderStatus["PENDING"] = "PENDING";
    EcommerceOrderStatus["COMPLETED"] = "COMPLETED";
    EcommerceOrderStatus["CANCELLED"] = "CANCELLED";
    EcommerceOrderStatus["REJECTED"] = "REJECTED";
})(EcommerceOrderStatus || (exports.EcommerceOrderStatus = EcommerceOrderStatus = {}));
var P2POfferStatus;
(function (P2POfferStatus) {
    P2POfferStatus["PENDING"] = "PENDING";
    P2POfferStatus["ACTIVE"] = "ACTIVE";
    P2POfferStatus["COMPLETED"] = "COMPLETED";
    P2POfferStatus["CANCELLED"] = "CANCELLED";
})(P2POfferStatus || (exports.P2POfferStatus = P2POfferStatus = {}));
var P2PTradeStatus;
(function (P2PTradeStatus) {
    P2PTradeStatus["PENDING"] = "PENDING";
    P2PTradeStatus["PAID"] = "PAID";
    P2PTradeStatus["DISPUTE_OPEN"] = "DISPUTE_OPEN";
    P2PTradeStatus["ESCROW_REVIEW"] = "ESCROW_REVIEW";
    P2PTradeStatus["CANCELLED"] = "CANCELLED";
    P2PTradeStatus["RELEASED"] = "RELEASED";
    P2PTradeStatus["COMPLETED"] = "COMPLETED";
    P2PTradeStatus["REFUNDED"] = "REFUNDED";
})(P2PTradeStatus || (exports.P2PTradeStatus = P2PTradeStatus = {}));
var P2PEscrowStatus;
(function (P2PEscrowStatus) {
    P2PEscrowStatus["PENDING"] = "PENDING";
    P2PEscrowStatus["HELD"] = "HELD";
    P2PEscrowStatus["RELEASED"] = "RELEASED";
    P2PEscrowStatus["CANCELLED"] = "CANCELLED";
})(P2PEscrowStatus || (exports.P2PEscrowStatus = P2PEscrowStatus = {}));
var P2PDiputeStatus;
(function (P2PDiputeStatus) {
    P2PDiputeStatus["PENDING"] = "PENDING";
    P2PDiputeStatus["IN_PROGRESS"] = "IN_PROGRESS";
    P2PDiputeStatus["RESOLVED"] = "RESOLVED";
    P2PDiputeStatus["CANCELLED"] = "CANCELLED";
})(P2PDiputeStatus || (exports.P2PDiputeStatus = P2PDiputeStatus = {}));
var MlmReferralStatus;
(function (MlmReferralStatus) {
    MlmReferralStatus[MlmReferralStatus["PENDING"] = 0] = "PENDING";
    MlmReferralStatus[MlmReferralStatus["ACTIVE"] = 1] = "ACTIVE";
    MlmReferralStatus[MlmReferralStatus["REJECTED"] = 2] = "REJECTED";
})(MlmReferralStatus || (exports.MlmReferralStatus = MlmReferralStatus = {}));
var MlmReferralConditionType;
(function (MlmReferralConditionType) {
    MlmReferralConditionType[MlmReferralConditionType["DEPOSIT"] = 0] = "DEPOSIT";
    MlmReferralConditionType[MlmReferralConditionType["TRADE"] = 1] = "TRADE";
    MlmReferralConditionType[MlmReferralConditionType["INVEST"] = 2] = "INVEST";
})(MlmReferralConditionType || (exports.MlmReferralConditionType = MlmReferralConditionType = {}));
var MlmReferralConditionRewardType;
(function (MlmReferralConditionRewardType) {
    MlmReferralConditionRewardType["FIXED"] = "FIXED";
    MlmReferralConditionRewardType["PERCENTAGE"] = "PERCENTAGE";
})(MlmReferralConditionRewardType || (exports.MlmReferralConditionRewardType = MlmReferralConditionRewardType = {}));
