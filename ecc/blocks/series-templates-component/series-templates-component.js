import { LIBS } from '../../scripts/scripts.js';
import {
  generateToolTip,
  decorateLabeledTextfield,
  getIcon,
} from '../../scripts/utils.js';

async function buildPreviewList(row) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [labelCol, sourseLinkCel] = row.querySelectorAll(':scope > div');

  const labelText = labelCol?.textContent.trim() || 'Event template';
  const sourceLink = sourseLinkCel?.textContent.trim();

  if (!labelText || !sourceLink) return;

  const label = createTag('span', { class: 'preview-list-label' }, labelText);
  const previewList = createTag('div', { class: 'preview-list' });
  const previewListTitle = createTag('h2', {}, 'Template set up');
  const previewListSubtitle = createTag('p', { class: 'preview-list-subtitle' }, 'Select a template');
  const previewListFieldset = createTag('fieldset', { class: 'preview-list-fieldset' });
  createTag('div', { class: 'preview-list-items' }, '', { parent: previewListFieldset });
  const previewListInput = createTag('input', { type: 'hidden', name: 'series-template-input', class: 'series-template-input' });
  const templateNameInput = createTag('sp-textfield', { class: 'series-template-name', size: 'xl', readonly: true });

  const previewListBtn = createTag('a', { class: 'con-button fill preview-list-btn' }, 'Select');
  const previewListOverlay = createTag('div', { class: 'preview-list-overlay hidden' });
  const previewListModal = createTag('div', { class: 'preview-list-modal' }, '', { parent: previewListOverlay });

  const actionArea = createTag('div', { class: 'preview-list-action-area' }, '');
  createTag('a', { class: 'preview-list-cancel-btn con-button outline' }, 'Cancel', { parent: actionArea });
  createTag('a', { class: 'preview-list-save-btn con-button fill' }, 'Save', { parent: actionArea });

  createTag('a', { class: 'preview-list-close-btn' }, getIcon('close-circle'), { parent: previewListModal });
  previewListModal.append(previewListTitle, previewListSubtitle, previewListFieldset, actionArea);
  previewList.append(
    label,
    templateNameInput,
    previewListInput,
    previewListBtn,
    previewListOverlay,
  );

  row.innerHTML = '';
  row.append(previewList);

  try {
    previewList.dataset.sourceLink = new URL(sourceLink).pathname;
  } catch (e) {
    window.lana?.log('Invalid template source link');
  }
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, ri) => {
    if (ri === 0) generateToolTip(r);

    if (ri === 1) {
      await decorateLabeledTextfield(r, { id: 'series-email-template' });
    }

    if (ri === 2) {
      await buildPreviewList(r);
    }
  });
}
