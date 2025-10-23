function isBlockComplete(block) {
  if (block.includeLiveStream && !block.mobileRiderSessionId) {
    return false;
  }
  return Boolean(block.fragmentPath && block.startDateTime && block.title);
}

function isScheduleComplete(schedule) {
  if (schedule.blocks.length === 0) return false;
  return schedule.blocks?.every((block) => isBlockComplete(block));
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
  });
  schedule.blocks = sortBlocks(schedule.blocks);
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
  static async createScheduleURL(scheduleObject) {
    if (!window.CompressionStream) {
      await import('../../scripts/deps/compression-polyfill.js');
    }
    try {
      // Convert object to JSON string
      const jsonString = JSON.stringify(scheduleObject);

      // Convert string to Uint8Array for compression
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);

      // Compress the data using gzip
      // eslint-disable-next-line no-undef
      const compressionStream = new CompressionStream('gzip');
      const writer = compressionStream.writable.getWriter();
      const reader = compressionStream.readable.getReader();

      // Write data to compression stream
      writer.write(data);
      writer.close();

      // Read compressed data
      const chunks = [];
      let done = false;
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // Combine chunks into single Uint8Array
      const compressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const compressedData = new Uint8Array(compressedLength);
      let offset = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const chunk of chunks) {
        compressedData.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to base64 for URL safety
      const base64String = btoa(String.fromCharCode(...compressedData));

      // URL encode the base64 string
      const encodedPayload = encodeURIComponent(base64String);

      // Create URL with current location as base
      const currentURL = new URL(window.location.href);
      currentURL.searchParams.set('schedule', encodedPayload);

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
      const encodedPayload = url.searchParams.get('schedule');

      if (!encodedPayload) {
        throw new Error('No schedule parameter found in URL');
      }

      // Decode the URL-encoded payload
      const base64String = decodeURIComponent(encodedPayload);

      // Convert base64 back to Uint8Array
      const binaryString = atob(base64String);
      const compressedData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i += 1) {
        compressedData[i] = binaryString.charCodeAt(i);
      }

      // Decompress the data
      if (!window.DecompressionStream) {
        await import('../../scripts/deps/compression-polyfill.js');
      }

      // eslint-disable-next-line no-undef
      const decompressionStream = new DecompressionStream('gzip');
      const writer = decompressionStream.writable.getWriter();
      const reader = decompressionStream.readable.getReader();

      // Write compressed data to decompression stream
      writer.write(compressedData);
      writer.close();

      // Read decompressed data
      const chunks = [];
      let done = false;
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // Combine chunks and decode to string
      const decompressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const decompressedData = new Uint8Array(decompressedLength);
      let offset = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const chunk of chunks) {
        decompressedData.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressedData);

      // Parse JSON back to object
      return JSON.parse(jsonString);
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
      const scheduleURL = await this.createScheduleURL(scheduleObject);

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
};
