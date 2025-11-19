import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function fetchMetadataOptions(key) {
  try {
    const response = await fetch(`/ecc/system/metadata-catalogue.json?sheet=${key}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch options for ${key}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    window.lana?.log(`Failed to fetch metadata options for ${key}: ${error.message}`);
    return [];
  }
}

function buildMetadataPicker(el, key, name, options) {
  const pickerId = `${key}-picker`;
  const pickerWrapper = createTag('div', { class: 'metadata-picker-wrapper' });
  const label = createTag('sp-field-label', { size: 'l', for: pickerId }, `${name} *`);
  const picker = createTag('sp-picker', {
    id: pickerId,
    class: 'select-input',
    required: true,
    size: 'l',
  });
  const placeholderLabel = createTag('span', { slot: 'label' }, `Select ${name.toLowerCase()}`);

  picker.appendChild(placeholderLabel);

  // Add options to picker
  options.forEach((option) => {
    const menuItem = createTag('sp-menu-item', {}, option.value);
    picker.appendChild(menuItem);
  });

  pickerWrapper.append(label, picker);
  el.append(pickerWrapper);
}

async function fetchAndBuildMetadataPickers(el) {
  try {
    const response = await fetch('/ecc/system/metadata-catalogue.json');
    if (!response.ok) {
      throw new Error('Failed to fetch metadata catalogue');
    }
    const catalogue = await response.json();

    if (!catalogue.data || catalogue.data.length === 0) {
      return;
    }

    // Fetch options for all pickers in parallel
    const optionsPromises = catalogue.data.map((pickerConfig) => (
      fetchMetadataOptions(pickerConfig.key)
        .then((options) => ({ config: pickerConfig, options }))
    ));

    const pickersData = await Promise.all(optionsPromises);

    // Build all pickers
    pickersData.forEach((pickerData) => {
      buildMetadataPicker(el, pickerData.config.key, pickerData.config.name, pickerData.options);
    });
  } catch (error) {
    window.lana?.log(`Failed to fetch metadata catalogue: ${error.message}`);
  }
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');

  if (rows.length > 0) {
    generateToolTip(rows[0]);
  }

  await fetchAndBuildMetadataPickers(el);
}
