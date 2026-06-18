// Adapter layer for the schedule→repo mapping.
// Swap the implementation of these three functions when backend support is added.

const STORAGE_KEY = 'sm-schedule-repo-map';

export function getRepoForSchedule(scheduleId) {
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return map[scheduleId] ?? null;
  } catch {
    return null;
  }
}

export function setRepoForSchedule(scheduleId, repoName) {
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    map[scheduleId] = repoName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* storage unavailable */ }
}

export function removeRepoForSchedule(scheduleId) {
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete map[scheduleId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* storage unavailable */ }
}
