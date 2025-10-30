function isBlockComplete(block) {
  if (block.includeLiveStream && !block.liveStream?.streamId) {
    return false;
  }
  return Boolean(block.fragmentPath && block.startDateTime && block.title);
}

function isScheduleComplete(schedule) {
  if (schedule.blocks.length === 0) return false;
  return schedule.blocks?.every((block) => isBlockComplete(block));
}

// Validation functions for submission
function isValidUrl(url) {
  if (!url || url.trim() === '') return true; // Empty is valid (optional field)
  // Check if it's a relative path (starts with /)
  if (url.startsWith('/')) {
    // Basic validation for relative paths
    return /^\/[\w\-./]*$/.test(url);
  }
  // Check if it's an absolute URL
  try {
    const urlObject = new URL(url);
    return Boolean(urlObject);
  } catch {
    return false;
  }
}

function validateBlock(block, blockIndex) {
  const errors = [];

  if (!block.title || block.title.trim() === '') {
    errors.push(`Block ${blockIndex + 1}: Title is required`);
  }

  if (block.fragmentPath && !isValidUrl(block.fragmentPath)) {
    errors.push(`Block ${blockIndex + 1} ("${block.title || 'Untitled'}"): Fragment path must be a valid relative or absolute URL`);
  }

  return errors;
}

function validateSchedule(schedule) {
  const errors = [];

  if (!schedule.title || schedule.title.trim() === '') {
    errors.push('Schedule title is required');
  }

  if (schedule.blocks && schedule.blocks.length > 0) {
    schedule.blocks.forEach((block, index) => {
      const blockErrors = validateBlock(block, index);
      errors.push(...blockErrors);
    });
  }

  return errors;
}

function sortBlocks(blocks) {
  return blocks?.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
}

// Assign a random id to each block
function assignIdToBlocks(schedule) {
  schedule.blocks.forEach((block) => {
    block.id = `block-${Math.random().toString(36).substring(2, 15)}`;
  });
}

// Prepare schedule for server consumption
function prepareScheduleForServer(schedule) {
  if (!schedule) return null;
  const deepCopyOfSchedule = JSON.parse(JSON.stringify(schedule));
  deepCopyOfSchedule.blocks.forEach((block) => {
    delete block.id;
    delete block.isEditingBlockTitle;
    if (!block.includeLiveStream) {
      delete block.liveStream;
    }
    if (!block.fragmentPath) {
      delete block.fragmentPath;
    }
  });
  return deepCopyOfSchedule;
}

// Prepare schedule for client consumption
function prepareScheduleForClient(schedule) {
  if (!schedule) return null;
  schedule.blocks.forEach((block) => {
    block.id = `block-${Math.random().toString(36).substring(2, 15)}`;
    block.isEditingBlockTitle = false;
    if (!block.liveStream) {
      block.liveStream = { provider: 'MobileRider', streamId: '' }; // {provider: 'MobileRider' | 'YouTube', url?: string, streamId?: string}
    }
    // Recalculate block's isComplete status
    block.isComplete = isBlockComplete(block);
  });
  schedule.blocks = sortBlocks(schedule.blocks);
  // Recalculate schedule's isComplete status based on all blocks
  schedule.isComplete = isScheduleComplete(schedule);
  return schedule;
}
// Prepare schedules loaded from the server for client consumption
function processSchedules(schedules) {
  // eslint-disable-next-line max-len
  const sortedSchedules = schedules?.sort((a, b) => new Date(b.modificationTime) - new Date(a.modificationTime));
  const decoratedSchedules = sortedSchedules?.map((schedule) => prepareScheduleForClient(schedule));
  return decoratedSchedules;
}

class ScheduleURLUtility {
  /**
   * Creates a shareable URL from a JavaScript object
   * @param {Object} scheduleObject - The schedule object to encode
   * @returns {string} - The complete shareable URL
   */
  static createScheduleURL(scheduleObject) {
    try {
      // Convert object to JSON string
      const jsonString = JSON.stringify(scheduleObject);

      const base64JsonString = btoa(jsonString);
      const encodedBase64JsonString = encodeURIComponent(base64JsonString);

      // Create URL with current location as base
      const currentURL = new URL(window.location.origin + window.location.pathname);
      currentURL.searchParams.set('schedule', encodedBase64JsonString);

      return currentURL.toString();
    } catch (error) {
      window.lana?.log(`Error creating schedule URL: ${error}`);
      throw new Error('Failed to create schedule URL');
    }
  }

  /**
   * Extracts and decodes a schedule object from a URL
   * @param {string} urlString - The URL containing the encoded schedule
   * @returns {Object} - The original schedule object
   */
  static async extractScheduleFromURL(urlString) {
    try {
      // Parse the URL
      const url = new URL(urlString);
      const encodedBase64JsonString = url.searchParams.get('schedule');

      if (!encodedBase64JsonString) {
        throw new Error('No schedule parameter found in URL');
      }

      // Decode the URL-encoded payload
      const decodedBase64JsonString = decodeURIComponent(encodedBase64JsonString);
      const decodedJsonString = atob(decodedBase64JsonString);
      const decodedScheduleObject = JSON.parse(decodedJsonString);
      return decodedScheduleObject;
    } catch (error) {
      window.lana?.log(`Error extracting schedule from URL: ${error}`);
      throw new Error('Failed to extract schedule from URL');
    }
  }

  /**
   * Copies a schedule URL to clipboard as a formatted link
   * @param {Object} scheduleObject - The schedule object to share
   * @returns {boolean} - True if successful, false otherwise
   */
  static async copyScheduleToClipboard(scheduleObject) {
    try {
      // Generate the URL using createScheduleURL
      const scheduleURL = this.createScheduleURL(scheduleObject);

      // Extract title and scheduleId from options
      const { title, scheduleId } = scheduleObject;
      // Create link text content
      const linkText = scheduleId ? `Schedule: ${title} (${scheduleId})` : `Schedule: ${title}`;

      // Create a virtual link element
      const linkElement = document.createElement('a');
      linkElement.href = scheduleURL;
      linkElement.textContent = linkText;

      const blob = new Blob([linkElement.outerHTML], { type: 'text/html' });
      // eslint-disable-next-line no-undef
      const data = [new ClipboardItem({ [blob.type]: blob })];

      // Check if the Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.write) {
        // For modern browsers, copy the URL as text
        await navigator.clipboard.write(data);
        return true;
      }
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = scheduleURL;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      window.lana?.log(`Error copying schedule to clipboard: ${error}`);
      return false;
    }
  }
}

export {
  isBlockComplete,
  isScheduleComplete,
  sortBlocks,
  processSchedules,
  prepareScheduleForClient,
  assignIdToBlocks,
  prepareScheduleForServer,
  ScheduleURLUtility,
  validateSchedule,
};
