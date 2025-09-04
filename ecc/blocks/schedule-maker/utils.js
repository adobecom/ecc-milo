function isBlockComplete(block) {
  return block.fragmentPath && block.startDateTime && block.title;
}

function isScheduleComplete(schedule) {
  return schedule.blocks?.every((block) => isBlockComplete(block));
}

function decorateBlock(block) {
  return {
    ...block,
    isComplete: isBlockComplete(block),
  };
}

function decorateBlocks(blocks) {
  // eslint-disable-next-line max-len
  const sortedBlocks = blocks?.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
  return sortedBlocks?.map((block) => decorateBlock(block));
}

function decorateSchedule(schedule) {
  return {
    ...schedule,
    isComplete: isScheduleComplete(schedule),
    blocks: decorateBlocks(schedule.blocks),
  };
}

function decorateSchedules(schedules) {
  // eslint-disable-next-line max-len
  const sortedSchedules = schedules?.sort((a, b) => new Date(b.modificationTime) - new Date(a.modificationTime));
  return sortedSchedules?.map((schedule) => decorateSchedule(schedule));
}

function assignIdToBlocks(schedule) {
  schedule.blocks.forEach((block) => {
    block.id = `block-${Math.random().toString(36).substring(2, 15)}`;
  });
}

export {
  isBlockComplete,
  isScheduleComplete,
  decorateBlocks,
  decorateSchedule,
  decorateSchedules,
  assignIdToBlocks,
};
