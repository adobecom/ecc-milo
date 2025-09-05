function isBlockComplete(block) {
  if (block.liveStream && !block.mobileRiderSessionId) {
    return false;
  }
  return Boolean(block.fragmentPath && block.startDateTime && block.title);
}

function isScheduleComplete(schedule) {
  return schedule.blocks?.every((block) => isBlockComplete(block));
}

function decorateBlock(block) {
  return {
    ...block,
    isComplete: isBlockComplete(block),
    liveStream: Boolean(block.mobileRiderSessionId),
  };
}

// Add isComplete to each block
function decorateBlocks(blocks) {
  // eslint-disable-next-line max-len
  const sortedBlocks = blocks?.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
  return sortedBlocks?.map((block) => decorateBlock(block));
}

// Add isComplete to the schedule and decorate the blocks
function decorateSchedule(schedule) {
  return {
    ...schedule,
    isComplete: isScheduleComplete(schedule),
    blocks: decorateBlocks(schedule.blocks),
  };
}

// Decorate the schedules
function decorateSchedules(schedules) {
  // eslint-disable-next-line max-len
  const sortedSchedules = schedules?.sort((a, b) => new Date(b.modificationTime) - new Date(a.modificationTime));
  return sortedSchedules?.map((schedule) => decorateSchedule(schedule));
}

// Assign a random id to each block
function assignIdToBlocks(schedule) {
  schedule.blocks.forEach((block) => {
    block.id = `block-${Math.random().toString(36).substring(2, 15)}`;
  });
}

function createServerFriendlySchedule(schedule) {
  const deepCopyOfSchedule = JSON.parse(JSON.stringify(schedule));
  delete deepCopyOfSchedule.isComplete;
  deepCopyOfSchedule.blocks.forEach((block) => {
    delete block.id;
    delete block.isComplete;
    delete block.liveStream;
  });
  return deepCopyOfSchedule;
}

export {
  isBlockComplete,
  isScheduleComplete,
  decorateBlocks,
  decorateSchedule,
  decorateSchedules,
  assignIdToBlocks,
  createServerFriendlySchedule,
};
