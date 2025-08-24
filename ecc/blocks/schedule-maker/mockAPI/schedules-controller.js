import schedules from './mock-schedules.js';

async function getSchedules() {
  // TODO: Replace with actual API call
  console.log('getSchedules');
  console.log({ schedules });
  return new Promise((resolve) => {
    setTimeout(() => resolve(schedules), 1500);
  });
}

async function createSchedule(schedule) {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(schedule), 150);
  });
}

async function updateSchedule(schedule) {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(schedule), 150);
  });
}

async function deleteSchedule(schedule) {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(schedule), 150);
  });
}

async function getSchedule(scheduleId) {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(schedules.find((schedule) => schedule.id === scheduleId)), 150);
  });
}

export { getSchedules, createSchedule, updateSchedule, deleteSchedule, getSchedule };
