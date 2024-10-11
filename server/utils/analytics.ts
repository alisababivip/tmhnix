export function convertAndSortCounts(countsPerDay) {
  return Object.keys(countsPerDay)
    .sort()
    .map((date) => ({
      date,
      count: countsPerDay[date],
    }))
}
