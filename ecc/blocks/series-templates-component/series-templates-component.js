import { LIBS } from '../../scripts/scripts.js';
import {
  generateToolTip,
  decorateLabeledTextfield,
} from '../../scripts/utils.js';

async function buildPreviewList(row) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [labelCol, sourseLinkCel] = row.querySelectorAll(':scope > div');

  const label = labelCol?.textContent.trim() || 'Event template';
  const sourceLink = sourseLinkCel?.textContent.trim();

  if (!label || !sourceLink) return;

  const previewList = createTag('div', { class: 'preview-list' });
  const previewListTitle = createTag('h4', {}, 'Select a template');
  const previewListItems = createTag('div', { class: 'preview-list-items' });
  const previewListBtn = createTag('a', { class: 'con-button preview-list-btn' }, label);
  const previewListOverlay = createTag('div', { class: 'preview-list-overlay hidden' });
  const previewListModal = createTag('div', { class: 'preview-list-modal' }, '', { parent: previewListOverlay });

  createTag('a', { class: 'preview-list-close-btn' }, '✕', { parent: previewListModal });
  previewListModal.append(previewListTitle, previewListItems);
  previewList.append(previewListBtn, previewListOverlay);
  row.innerHTML = '';
  row.append(previewList);
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, ri) => {
    if (ri === 0) generateToolTip(r);

    if (ri === 1) {
      await decorateLabeledTextfield(r, { id: 'info-field-series-susi' });
    }

    if (ri === 2) {
      await buildPreviewList(r);
    }
  });
}
