import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateRTETiptap(row) {
  row.classList.add('rte-tiptap-row');
  const cols = row.querySelectorAll(':scope > div');

  if (!cols.length) return;
  if (cols.length < 2) return;
  const maxLengthCol = cols[1];
  const isRequired = maxLengthCol?.textContent.trim().endsWith('*');
  const maxCharNum = maxLengthCol?.querySelector('strong')?.textContent.trim();

  const rteProps = {
    id: 'rsvp-description-rte',
    ...(isRequired && { required: true }),
    ...(maxCharNum && { characterLimit: maxCharNum }),
  };
  const rte = createTag('rte-tiptap', rteProps);
  const rteOutput = createTag('input', { id: 'rsvp-description-rte-output', type: 'hidden' });

  row.innerHTML = '';
  row.append(rteOutput);
  row.append(rte);
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        break;
      case 1:
        r.classList.add('registration-configs-wrapper');
        r.innerHTML = '';
        break;
      case 2:
        decorateRTETiptap(r);
        break;
      default:
        break;
    }
  });
}
