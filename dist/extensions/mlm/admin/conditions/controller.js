"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries"); // Make sure to implement these functions in your queries file.
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listReferralConditions)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getReferralConditionById)(id);
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const { id } = params;
        const { status } = body;
        return (0, queries_1.updateReferralConditionStatus)(id, status);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const { id } = params;
        const { title, description, reward, reward_type, reward_currency } = body;
        return (0, queries_1.updateReferralConditionById)(id, title, description, reward, reward_type, reward_currency);
    }),
};
