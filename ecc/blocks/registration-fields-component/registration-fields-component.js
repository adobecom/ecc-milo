import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';
import { SUPPORTED_CLOUDS } from '../../scripts/constants.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateRSVPFields(el, rsvpFormConfigs) {
  const row = el.querySelector(':scope > div:last-of-type');

  if (!row) return;

  el.dataset.rsvpFormConfigs = JSON.stringify(rsvpFormConfigs);
  row.innerHTML = '';

  createTag(
    'rsvp-form',
    { class: 'rsvp-form' },
    '',
    { parent: row },
  );
}

export default async function init(el) {
  el.classList.add('form-component');
  const rsvpFormConfigs = await Promise.all(SUPPORTED_CLOUDS.map(async ({ id }) => {
    const config = await fetch(`/ecc/system/rsvp-config-sheets/${id.toLowerCase()}.json`).then((resp) => (resp.ok ? resp.json() : null));
    return { cloudType: id, config };
  }));
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateRSVPFields(el, rsvpFormConfigs);
}
