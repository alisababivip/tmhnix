"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCrons = void 0;
const controller_1 = require("./http/currencies/controller");
const controller_2 = require("./http/exchange/binary/orders/controller");
const controller_3 = require("./http/exchange/currencies/controller");
const queries_1 = require("./http/investment/queries");
const controller_4 = require("./http/wallets/spot/controller");
const logger_1 = require("./logger");
const logger = (0, logger_1.createLogger)('Cron');
function initializeCrons() {
    runTaskAtInterval('crypto currencies prices', controller_3.processCurrenciesPrices, 2 * 60 * 1000);
    runTaskAtInterval('Pending Deposits', controller_4.processPendingDeposits, 15 * 60 * 1000);
    runTaskAtInterval('Pending Withdrawals', controller_4.processPendingWithdrawals, 30 * 60 * 1000);
    runTaskAtSpecificMinute('All concurrent tasks', runConcurrentTasks, 0);
    logger.info('Cron jobs initialized!');
}
exports.initializeCrons = initializeCrons;
function runTaskAtInterval(name, task, interval) {
    let isRunning = false;
    setInterval(async () => {
        if (isRunning) {
            return;
        }
        isRunning = true;
        try {
            await task();
        }
        catch (error) {
            logger.error(`Error running ${name} scheduler: ${error}`);
        }
        finally {
            isRunning = false;
        }
    }, interval);
}
function runTaskAtSpecificMinute(name, task, minute) {
    setInterval(async () => {
        const date = new Date();
        if (date.getMinutes() === minute) {
            try {
                await task();
            }
            catch (error) {
                logger.error(`Error running ${name} scheduler: ${error}`);
            }
        }
    }, 60 * 1000);
}
async function runConcurrentTasks() {
    const tasks = [
        queries_1.checkInvestments,
        controller_1.fetchFiatCurrencyPrices,
        controller_2.processPendingOrders,
    ];
    try {
        await Promise.all(tasks.map((task) => task()));
    }
    catch (error) {
        logger.error(`Error running tasks concurrently: ${error}`);
    }
}
