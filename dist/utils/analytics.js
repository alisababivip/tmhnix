"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAndSortCounts = void 0;
function convertAndSortCounts(countsPerDay) {
    return Object.keys(countsPerDay)
        .sort()
        .map((date) => ({
        date,
        count: countsPerDay[date],
    }));
}
exports.convertAndSortCounts = convertAndSortCounts;
