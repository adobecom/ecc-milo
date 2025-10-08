/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import { LIBS } from '../../scripts/scripts.js';
import { getCloud } from '../../scripts/esp-controller.js';
import { deepGetTagByTagID, getCaasTags } from '../../scripts/caas.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { CONTENT_TYPE_TAGS } from '../../scripts/constants.js';

const closeSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-shaded {fill: #464646;}</style></defs><title>S Close 18 N</title><rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill-shaded" d="M14.5,4.5l-1-1L9,9l-4.5-4.5l-1,1L8,10l-4.5,4.5l1,1L9,11l4.5,4.5l1-1L10,10l4.5-4.5z" /></svg>';

// Cache for tag suggestions
let allTagsCache = null;
const DEBOUNCE_DELAY = 300;

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get all available tags from CaaS (cached)
async function getAllTags() {
  if (allTagsCache) {
    return allTagsCache;
  }

  try {
    const caasTags = await getCaasTags();

    if (!caasTags || !caasTags.namespaces || !caasTags.namespaces.caas) {
      allTagsCache = [];
      return [];
    }

    // Extract all tags from the CaaS namespace
    const allTags = [];

    // Helper function to recursively extract tags
    const extractTags = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          // If this object has tagID and title, it's a tag
          if (value.tagID && value.title) {
            allTags.push({
              name: value.title,
              caasId: value.tagID,
            });
          } else {
            // Otherwise, recurse into nested objects
            extractTags(value, path ? `${path}/${key}` : key);
          }
        }
      });
    };

    extractTags(caasTags.namespaces.caas);
    allTagsCache = allTags;
    return allTags;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching CaaS tags:', error);
    allTagsCache = [];
    return [];
  }
}

// Filter tags based on search query
function filterTags(tags, query) {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  return tags.filter((tag) => (
    tag.name && tag.name.toLowerCase().includes(lowerQuery)
  )).slice(0, 10); // Limit to 10 suggestions
}

// Create a tag chip element
async function createTagChip(tag, onRemove) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const chip = createTag('div', { class: 'tag-chip' }, '', { parent: null });
  chip.innerHTML = `
    <span class="tag-name">${tag.name}</span>
    <button type="button" class="tag-remove" data-tag-name="${tag.name}">
      <sp-icon size="s">${closeSvg}</sp-icon>
    </button>
  `;

  chip.querySelector('.tag-remove').addEventListener('click', () => onRemove(tag.name));
  return chip;
}

// Create suggestion item element
async function createSuggestionItem(tag, onSelect) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const item = createTag('div', { class: 'suggestion-item' }, tag.name, { parent: null });
  item.addEventListener('click', () => onSelect(tag));
  return item;
}

// Remove a tag from selected tags
function removeSelectedTag(el, tagName) {
  if (!el.selectedTags.has(tagName)) return;

  el.selectedTags.delete(tagName);

  const chip = el.selectedTagsContainer.querySelector(`[data-tag-name="${tagName}"]`)?.closest('.tag-chip');
  if (chip) {
    chip.remove();
  }
}

// Add a tag to the selected tags
async function addSelectedTag(el, tag) {
  if (el.selectedTags.has(tag.name)) return;

  el.selectedTags.set(tag.name, tag);

  const tagChip = await createTagChip(tag, (tagName) => {
    removeSelectedTag(el, tagName);
  });

  el.selectedTagsContainer.appendChild(tagChip);
}

// Build the new tagging UI
async function buildTopicsUI(el) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  if (!el) return;

  // Clear existing content
  el.innerHTML = '';

  // Create main container
  const container = createTag('div', { class: 'topics-container' }, '', { parent: el });

  // Create selected tags display
  const selectedTagsContainer = createTag('div', { class: 'selected-tags' }, '', { parent: container });

  // Create input container
  const inputContainer = createTag('div', { class: 'input-container' }, '', { parent: container });

  // Create text input
  const textInput = createTag('sp-textfield', { placeholder: 'Type to search for topics...' }, '', { parent: inputContainer });

  // Create suggestions dropdown
  const suggestionsDropdown = createTag('div', { class: 'suggestions-dropdown' }, '', { parent: inputContainer });

  // Store references for later use
  el.selectedTagsContainer = selectedTagsContainer;
  el.textInput = textInput;
  el.suggestionsDropdown = suggestionsDropdown;
  el.selectedTags = new Map(); // name -> tag object

  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (!query || query.length < 2) {
      suggestionsDropdown.style.display = 'none';
      return;
    }

    const allTags = await getAllTags();
    const filteredTags = filterTags(allTags, query);

    // Remove already selected tags from suggestions
    const availableTags = filteredTags.filter((tag) => !el.selectedTags.has(tag.name));

    if (availableTags.length === 0) {
      suggestionsDropdown.style.display = 'none';
      return;
    }

    // Clear and populate suggestions
    suggestionsDropdown.innerHTML = '';
    const suggestionPromises = availableTags.map(async (tag) => {
      const suggestionItem = await createSuggestionItem(tag, async (selectedTag) => {
        await addSelectedTag(el, selectedTag);
        textInput.value = '';
        suggestionsDropdown.style.display = 'none';
      });
      return suggestionItem;
    });

    const suggestionItems = await Promise.all(suggestionPromises);
    suggestionItems.forEach((item) => suggestionsDropdown.appendChild(item));

    suggestionsDropdown.style.display = 'block';
  }, DEBOUNCE_DELAY);

  // Input event listener
  textInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!inputContainer.contains(e.target)) {
      suggestionsDropdown.style.display = 'none';
    }
  });

  // Handle Enter key to add first suggestion
  textInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = textInput.value.trim();
      if (query.length >= 2) {
        const allTags = await getAllTags();
        const filteredTags = filterTags(allTags, query);
        const availableTags = filteredTags.filter((tag) => !el.selectedTags.has(tag.name));

        if (availableTags.length > 0) {
          await addSelectedTag(el, availableTags[0]);
          textInput.value = '';
          suggestionsDropdown.style.display = 'none';
        }
      }
    }
  });
}

// Prefill topics for editing existing events
async function prefillTopics(component, eventData) {
  if (!eventData.topics || eventData.topics.length === 0) return [];

  // Get all available tags to find the full tag objects
  const allTags = await getAllTags();
  const selectedTags = [];

  const prefillPromises = eventData.topics.map(async (topicName) => {
    const tag = allTags.find((t) => t.name === topicName);
    if (tag) {
      await addSelectedTag(component, tag);
      return topicName;
    }
    return null;
  });

  const results = await Promise.all(prefillPromises);
  return results.filter((result) => result !== null);
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;
  const eventType = getAttribute(props.eventDataResp, 'eventType', props.locale);

  // Get selected tags from the new UI
  const selectedTags = component.selectedTags ? Array.from(component.selectedTags.values()) : [];
  const topics = selectedTags.map((tag) => tag.name);
  const contentTypeTag = eventType ? CONTENT_TYPE_TAGS[eventType] : null;

  let tags = [];
  if (contentTypeTag) {
    const transformedContentTypeTag = {
      name: contentTypeTag.title,
      caasId: contentTypeTag.caasId,
    };

    tags = [...selectedTags, transformedContentTypeTag];
  } else {
    tags = selectedTags;
  }

  const { payload } = props;
  payload.topics = topics;
  const tagsToSubmit = [...new Set([...tags, contentTypeTag].filter((tag) => tag).map((tag) => tag.caasId))].join(',');
  if (tagsToSubmit) payload.tags = tagsToSubmit;
  props.payload = payload;
}

export async function onPayloadUpdate(component, props) {
  const eventData = props.eventDataResp;

  // Initialize the UI if not already done
  if (!component.selectedTags) {
    await buildTopicsUI(component);

    const prefilledTopics = await prefillTopics(component, eventData);

    if (prefilledTopics.length) component.classList.add('prefilled');
  }
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  // Initialize the UI immediately
  await buildTopicsUI(component);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
