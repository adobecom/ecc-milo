import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';
import { fetchRsvpFormConfigs } from '../../scripts/esp-controller.js';

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
  const rsvpFormConfigs = await fetchRsvpFormConfigs();
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateRSVPFields(el, rsvpFormConfigs);
}
