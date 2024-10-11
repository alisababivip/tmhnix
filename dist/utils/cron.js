"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const worker_threads_1 = require("worker_threads");
class CronManager {
    jobs;
    constructor() {
        this.jobs = {};
    }
    addJob(name, schedule, taskPath) {
        if (this.jobs[name]) {
            console.warn(`Cron job '${name}' is already defined and will not be added again.`);
            return;
        }
        const job = node_cron_1.default.schedule(schedule, () => {
            console.log(`Cron job '${name}' is running.`);
            const worker = new worker_threads_1.Worker(taskPath);
            worker.on('message', (message) => {
                console.log(`Cron job '${name}' message:`, message);
            });
            worker.on('error', (error) => {
                console.error(`Error in worker for job '${name}':`, error);
            });
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker for job '${name}' stopped with exit code ${code}`);
                }
            });
        }, { scheduled: false });
        this.jobs[name] = job;
    }
    startJob(name) {
        if (this.jobs[name]) {
            this.jobs[name].start();
            console.log(`Cron job '${name}' started.`);
        }
        else {
            console.error(`Cron job '${name}' not found.`);
        }
    }
    stopJob(name) {
        if (this.jobs[name]) {
            this.jobs[name].stop();
            console.log(`Cron job '${name}' stopped.`);
        }
        else {
            console.error(`Cron job '${name}' not found.`);
        }
    }
}
exports.default = new CronManager();
