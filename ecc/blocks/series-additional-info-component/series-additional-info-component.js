import {
  generateToolTip,
  decorateLabeledTextfield,
} from '../../scripts/utils.js';

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, ri) => {
    if (ri === 0) generateToolTip(r);

    if (ri === 1) {
      await decorateLabeledTextfield(r, { id: 'info-field-series-susi' });
    }

    if (ri === 2) {
      await decorateLabeledTextfield(r, { id: 'info-field-series-related-domain' });
    }

    if (ri === 3) {
      await decorateLabeledTextfield(r, { id: 'info-field-series-ext-id' });
    }
  });
}
